import process from 'node:process';
// Performance gate runner (docs/v5/PERFORMANCE.md §4, §5, §10).
//
// Run on a quiet machine: close other load first. Medians absorb spikes,
// but persistent contention (builds, test watchers, browser tabs) skews
// wall-clock ratios uniformly — if every row degrades together including
// mounts, suspect the environment, not the code, and re-run quiet.
//
// Compares the current checkout against a frozen v4 baseline across:
// - cold-query search medians (≤110% of baseline for each query);
// - warm/incremental typing sequences (whole-sequence ≤110%, no step >125%);
// - cold data preparation for a fresh dataset identity (≤110%);
// - one-picker and ten-picker initialization medians (≤110%);
// - ten same-dataset mounts construct the base index exactly once
//   (deterministic counter on the v5 side).
//
// The baseline is reconstructed from a pristine `master` worktree because
// no Phase-0 baseline was frozen before refactoring; see
// bench/baseline.json. Wall-clock gates use median-of-N runs.
// Deterministic invariants (cache identity, render isolation,
// cancellation, scroll coalescing) are covered by unit tests, not here.
//
// Usage:
//   npm run check:perf                     # compare working tree vs baseline
//   npm run check:perf -- --record         # rebuild baseline from master
//   npm run check:perf -- --record --ref <git-ref> --probe v4|v5
//   Options: --runs <n> (default 5), --samples <n> cold-query samples
//   (default 50), --mount-samples <n> (default 8).
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const repoRoot = join(__dirname, '..');
const esbuildBin = join(repoRoot, 'node_modules', '.bin', 'esbuild');
const baselinePath = join(repoRoot, 'bench', 'baseline.json');
import {
  median,
  COLD_QUERIES,
  INCREMENTAL_SEQUENCES,
  installDom,
} from './util.js';

type Probe = typeof import('./probe-v5');
type TimingOptions = { runs: number; samples: number; mountSamples: number };
type Metrics = {
  cold: Record<string, number>;
  incremental: Array<{
    sequence: string;
    total: number;
    steps: Array<{ query: string; median: number }>;
  }>;
  prepare: number;
  mount: { one: number; ten: number };
  baseBuildsForTenMounts?: number | null;
  baseBuildsForFreshTenMounts?: number;
};
type Options = TimingOptions & {
  record: boolean;
  ref: string;
  probe: string | null;
};

function parseArgs(argv: string[]) {
  const args: Options = {
    record: false,
    ref: 'master',
    probe: null,
    runs: 5,
    samples: 50, // PERFORMANCE.md §4.1: at least 50 per query
    mountSamples: 8,
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--record') args.record = true;
    else if (argv[i] === '--ref') args.ref = argv[++i];
    else if (argv[i] === '--probe') args.probe = argv[++i];
    else if (argv[i] === '--runs') args.runs = Number(argv[++i]);
    else if (argv[i] === '--samples') args.samples = Number(argv[++i]);
    else if (argv[i] === '--mount-samples')
      args.mountSamples = Number(argv[++i]);
  }
  if (!args.probe) {
    args.probe = args.record ? 'v4' : 'v5';
  }
  return args;
}

function bundleProbe(probe: string, checkoutDir: string) {
  // Bundles live under the repo so external peer imports (react,
  // react-dom, jsdom) resolve from the repo's node_modules.
  const tmpDir = join(repoRoot, 'bench', '.tmp');
  mkdirSync(tmpDir, { recursive: true });
  const outFile = join(tmpDir, `probe-${Date.now()}.cjs`);
  const result = spawnSync(
    esbuildBin,
    [
      join(repoRoot, 'bench', probe),
      '--bundle',
      '--format=cjs',
      '--platform=node',
      '--target=node18',
      '--external:react',
      '--external:react-dom',
      '--external:jsdom',
      '--external:shipstyles',
      // v4 sources import icons as SVG files (rollup-plugin-svg data URIs).
      '--loader:.svg=dataurl',
      `--alias:@c=${join(checkoutDir, 'src')}`,
      `--outfile=${outFile}`,
      '--log-level=warning',
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    throw new Error(`esbuild failed for ${probe}`);
  }
  return outFile;
}

function ensureWorktree(ref: string) {
  const dir = mkdtempSync(join(tmpdir(), 'epr-perf-baseline-'));
  execFileSync('git', ['worktree', 'add', '--detach', dir, ref], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  return dir;
}

function removeWorktree(dir: string) {
  execFileSync('git', ['worktree', 'remove', '--force', dir], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function measure({
  probeModule,
  runs,
  samples,
  mountSamples,
}: TimingOptions & { probeModule: Probe }): Metrics {
  const metrics: Metrics = {
    cold: {},
    incremental: [],
    prepare: 0,
    mount: { one: 0, ten: 0 },
  };

  // Warmup: JIT + caches outside the timed section.
  probeModule.prepareOnce();
  for (const query of COLD_QUERIES) {
    probeModule.resetQueryMemo();
    for (let i = 0; i < 5; i += 1) {
      probeModule.coldQuery(query);
    }
  }
  for (let i = 0; i < 3; i += 1) {
    probeModule.mountOne();
  }

  const coldRuns: Record<string, number[]> = {};
  for (const query of COLD_QUERIES) {
    coldRuns[query] = [];
  }
  const sequenceTotals = INCREMENTAL_SEQUENCES.map((): number[] => []);
  const sequenceSteps = INCREMENTAL_SEQUENCES.map((sequence) =>
    sequence.map((): number[] => []),
  );
  const prepareSamples = [];
  const mountOneSamples = [];
  const mountTenSamples = [];

  for (let run = 0; run < runs; run += 1) {
    for (const query of COLD_QUERIES) {
      const samplesForQuery = [];
      for (let i = 0; i < samples; i += 1) {
        // Cold per sample: prepared data/index stays built, only the
        // per-query memo is reset — never rebuilt inside the timer.
        probeModule.resetQueryMemo();
        samplesForQuery.push(probeModule.coldQuery(query));
      }
      coldRuns[query].push(median(samplesForQuery));
    }

    INCREMENTAL_SEQUENCES.forEach((sequence, sequenceIndex) => {
      for (let i = 0; i < samples; i += 1) {
        probeModule.resetQueryMemo();
        let total = 0;
        sequence.forEach((query, stepIndex) => {
          const elapsed = probeModule.coldQuery(query);
          sequenceSteps[sequenceIndex][stepIndex].push(elapsed);
          total += elapsed;
        });
        sequenceTotals[sequenceIndex].push(total);
      }
    });

    for (let i = 0; i < mountSamples; i += 1) {
      prepareSamples.push(probeModule.coldPrepare());
    }
    for (let i = 0; i < mountSamples; i += 1) {
      mountOneSamples.push(probeModule.mountOne());
    }
    for (let i = 0; i < Math.max(1, Math.floor(mountSamples / 2)); i += 1) {
      mountTenSamples.push(probeModule.mountTen());
    }
  }

  for (const query of COLD_QUERIES) {
    metrics.cold[query] = median(coldRuns[query]);
  }
  metrics.incremental = INCREMENTAL_SEQUENCES.map((sequence, index) => ({
    sequence: sequence.join(' > '),
    total: median(sequenceTotals[index]),
    steps: sequence.map((query, stepIndex) => ({
      query,
      median: median(sequenceSteps[index][stepIndex]),
    })),
  }));
  metrics.prepare = median(prepareSamples);
  metrics.mount = {
    one: median(mountOneSamples),
    ten: median(mountTenSamples),
  };

  // Deterministic multi-root sharing invariant (v5 probe only; the v4
  // probe reports -1). The harness always warms the cache first, so ten
  // mounts against the shared dataset identity must add zero base builds.
  if (typeof probeModule.baseBuilds === 'function') {
    probeModule.resetBaseBuilds();
    probeModule.prepareOnce();
    const before = probeModule.baseBuilds();
    if (before >= 0) {
      probeModule.mountTen();
      metrics.baseBuildsForTenMounts = probeModule.baseBuilds() - before;
      probeModule.resetBaseBuilds();
      probeModule.mountTenFreshDataset();
      metrics.baseBuildsForFreshTenMounts = probeModule.baseBuilds();
    }
  }

  return metrics;
}

function measureCheckout({
  checkoutDir,
  probe,
  runs,
  samples,
  mountSamples,
}: TimingOptions & { checkoutDir: string; probe: string | null }) {
  const outFile = bundleProbe(`probe-${probe}.ts`, checkoutDir);
  try {
    const probeModule = require(outFile) as Probe;
    const React = require('react') as typeof import('react');
    const ReactDOMClient =
      require('react-dom/client') as typeof import('react-dom/client');
    const { flushSync } = require('react-dom') as typeof import('react-dom');
    probeModule.setReactDeps({ React, ReactDOMClient, flushSync });
    return measure({ probeModule, runs, samples, mountSamples });
  } finally {
    delete require.cache[outFile];
    rmSync(join(repoRoot, 'bench', '.tmp'), {
      recursive: true,
      force: true,
    });
  }
}

function gate(current: Metrics, baseline: Metrics) {
  const failures = [];
  const lines = ['metric | baseline ms | current ms | ratio | gate'];

  // Timer-noise floor: below ~10µs a ratio is meaningless (call overhead
  // dominates; both paths are O(1) bucket/memo hits). Such rows pass on an
  // absolute budget instead, which still catches any real algorithmic
  // regression (e.g. an accidental full scan costs hundreds of µs).
  const NOISE_FLOOR_MS = 0.01;
  const ABSOLUTE_BUDGET_MS = 0.05;

  function checkRow(
    name: string,
    base: number,
    value: number,
    limit: number,
    hardLimit?: number,
  ) {
    if (
      !Number.isFinite(base) ||
      !Number.isFinite(value) ||
      base < 0 ||
      value < 0
    ) {
      failures.push(
        `${name}: invalid timing metric (baseline ${base}, current ${value})`,
      );
      lines.push(`${name} | ${base} | ${value} | invalid | FAIL`);
      return;
    }
    if (base < NOISE_FLOOR_MS) {
      const ok = value < ABSOLUTE_BUDGET_MS;
      lines.push(
        `${name} | ${base.toFixed(3)} | ${value.toFixed(3)} | absolute (<${ABSOLUTE_BUDGET_MS}ms) | ${ok ? 'pass' : 'FAIL'}`,
      );
      if (!ok) {
        failures.push(
          `${name}: ${value.toFixed(3)}ms exceeds absolute budget ${ABSOLUTE_BUDGET_MS}ms`,
        );
      }
      return;
    }
    const ratio = value / base;
    const status = ratio <= limit ? 'pass' : 'FAIL';
    lines.push(
      `${name} | ${base.toFixed(3)} | ${value.toFixed(3)} | ${(ratio * 100).toFixed(1)}% | ${status}`,
    );
    if (ratio > (hardLimit ?? limit)) {
      failures.push(
        `${name}: ${(ratio * 100).toFixed(1)}% exceeds ${(hardLimit ?? limit) * 100}%`,
      );
    }
  }

  for (const query of COLD_QUERIES) {
    checkRow(
      `cold query "${query}"`,
      baseline.cold[query],
      current.cold[query],
      // PERFORMANCE.md §4.1: each fixture MUST be <=110% (hard gate).
      1.1,
      1.1,
    );
  }
  current.incremental.forEach((sequence, index) => {
    checkRow(
      `incremental "${sequence.sequence}" total`,
      baseline.incremental[index].total,
      sequence.total,
      1.1,
      1.1,
    );
    sequence.steps.forEach((step, stepIndex) => {
      checkRow(
        `incremental "${sequence.sequence}" step "${step.query}"`,
        baseline.incremental[index].steps[stepIndex].median,
        step.median,
        1.25,
        1.25,
      );
    });
  });
  // PERFORMANCE.md §1 / ACCEPTANCE_CHECKLIST §16: cold preparation <=110%.
  checkRow(
    'cold data preparation',
    baseline.prepare,
    current.prepare,
    1.1,
    1.1,
  );
  checkRow('mount one picker', baseline.mount.one, current.mount.one, 1.1, 1.1);
  checkRow(
    'mount ten pickers',
    baseline.mount.ten,
    current.mount.ten,
    1.1,
    1.1,
  );

  for (const [name, value, expected] of [
    ['additional base builds for ten warm mounts', current.baseBuildsForTenMounts, 0],
    ['base builds for ten fresh-dataset mounts', current.baseBuildsForFreshTenMounts, 1],
  ] as const) {
    const ok = value === expected;
    lines.push(`${name} | ${expected} | ${value} | ${ok ? 'pass' : 'FAIL'}`);
    if (!ok) failures.push(`${name}: expected ${expected}, received ${value}`);
  }

  console.log(lines.join('\n'));
  return failures;
}

function readBaseline(text: string): { metrics: Metrics } {
  const value: unknown = JSON.parse(text);
  const isRecord = (input: unknown): input is Record<string, unknown> =>
    !!input && typeof input === 'object';
  if (!isRecord(value) || !isRecord(value.metrics))
    throw new Error('invalid benchmark baseline');
  const metrics = value.metrics;
  if (
    !isRecord(metrics.cold) ||
    !Object.values(metrics.cold).every((n) => typeof n === 'number') ||
    typeof metrics.prepare !== 'number' ||
    !isRecord(metrics.mount) ||
    typeof metrics.mount.one !== 'number' ||
    typeof metrics.mount.ten !== 'number' ||
    !Array.isArray(metrics.incremental) ||
    !metrics.incremental.every(
      (sequence) =>
        isRecord(sequence) &&
        typeof sequence.sequence === 'string' &&
        typeof sequence.total === 'number' &&
        Array.isArray(sequence.steps) &&
        sequence.steps.every(
          (step) =>
            isRecord(step) &&
            typeof step.query === 'string' &&
            typeof step.median === 'number',
        ),
    )
  ) {
    throw new Error('invalid benchmark baseline metrics');
  }
  return value as { metrics: Metrics };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  installDom();

  if (args.record) {
    const dir = ensureWorktree(args.ref);
    try {
      const metrics = measureCheckout({
        checkoutDir: dir,
        probe: args.probe,
        runs: args.runs,
        samples: args.samples,
        mountSamples: args.mountSamples,
      });
      const sha = execFileSync('git', ['rev-parse', args.ref], {
        cwd: repoRoot,
        encoding: 'utf8',
      }).trim();
      const baseline = {
        note: 'Reconstructed v4 baseline: no Phase-0 baseline was frozen before refactoring.',
        ref: args.ref,
        sha,
        date: new Date().toISOString(),
        node: process.version,
        runs: args.runs,
        samples: args.samples,
        mountSamples: args.mountSamples,
        metrics,
      };
      writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + '\n');
      console.log(`baseline recorded from ${args.ref} (${sha})`);
    } finally {
      removeWorktree(dir);
    }
    return;
  }

  if (!existsSync(baselinePath)) {
    throw new Error(
      'bench/baseline.json missing; run `npm run check:perf -- --record` first.',
    );
  }
  const baseline = readBaseline(readFileSync(baselinePath, 'utf8'));
  const current = measureCheckout({
    checkoutDir: repoRoot,
    probe: 'v5',
    runs: args.runs,
    samples: args.samples,
    mountSamples: args.mountSamples,
  });

  const failures = gate(current, baseline.metrics);
  if (failures.length > 0) {
    console.error('performance gate failed:\n  - ' + failures.join('\n  - '));
    process.exit(1);
  }
  console.log('performance gate: all wall-clock gates passed');
}

if (require.main === module) main();
export { gate };
