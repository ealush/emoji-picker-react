// Performance gate runner (docs/v5/PERFORMANCE.md §4, §5, §10).
//
// Run on a quiet machine: close other load first. Medians absorb spikes,
// but persistent contention (builds, test watchers, browser tabs) skews
// wall-clock ratios uniformly — if every row degrades together including
// mounts, suspect the environment, not the code, and re-run quiet.
//
// Compares the current checkout against a frozen v4 baseline across:
// - cold-query search medians (≤110% of baseline each, no query >125%);
// - warm/incremental typing sequences (whole-sequence ≤110%, no step >125%);
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
//   (default 30), --mount-samples <n> (default 8).
const { execFileSync, spawnSync } = require('child_process');
const {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const repoRoot = join(__dirname, '..');
const esbuildBin = join(repoRoot, 'node_modules', '.bin', 'esbuild');
const baselinePath = join(repoRoot, 'bench', 'baseline.json');
const {
  median,
  COLD_QUERIES,
  INCREMENTAL_SEQUENCES,
  installDom,
} = require('./util');

function parseArgs(argv) {
  const args = {
    record: false,
    ref: 'master',
    probe: null,
    runs: 5,
    samples: 30,
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

function bundleProbe(probe, checkoutDir) {
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
      '--loader:.svg=text',
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

function ensureWorktree(ref) {
  const dir = mkdtempSync(join(tmpdir(), 'epr-perf-baseline-'));
  execFileSync('git', ['worktree', 'add', '--detach', dir, ref], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
  return dir;
}

function removeWorktree(dir) {
  execFileSync('git', ['worktree', 'remove', '--force', dir], {
    cwd: repoRoot,
    stdio: 'inherit',
  });
}

function measure({ probeModule, runs, samples, mountSamples }) {
  const metrics = { cold: {}, incremental: {}, mount: {} };

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

  const coldRuns = {};
  for (const query of COLD_QUERIES) {
    coldRuns[query] = [];
  }
  const sequenceTotals = INCREMENTAL_SEQUENCES.map(() => []);
  const sequenceSteps = INCREMENTAL_SEQUENCES.map((sequence) =>
    sequence.map(() => []),
  );
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
    }
  }

  return metrics;
}

function measureCheckout({ checkoutDir, probe, runs, samples, mountSamples }) {
  const outFile = bundleProbe(`probe-${probe}.ts`, checkoutDir);
  try {
    const probeModule = require(outFile);
    const React = require('react');
    const ReactDOMClient = require('react-dom/client');
    const { flushSync } = require('react-dom');
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

function gate(current, baseline) {
  const failures = [];
  const lines = ['metric | baseline ms | current ms | ratio | gate'];

  // Timer-noise floor: below ~10µs a ratio is meaningless (call overhead
  // dominates; both paths are O(1) bucket/memo hits). Such rows pass on an
  // absolute budget instead, which still catches any real algorithmic
  // regression (e.g. an accidental full scan costs hundreds of µs).
  const NOISE_FLOOR_MS = 0.01;
  const ABSOLUTE_BUDGET_MS = 0.05;

  function checkRow(name, base, value, limit, hardLimit) {
    if (base < NOISE_FLOOR_MS) {
      const ok = value < ABSOLUTE_BUDGET_MS;
      lines.push(
        `${name} | ${base.toFixed(3)} | ${value.toFixed(3)} | absolute (<${ABSOLUTE_BUDGET_MS}ms) | ${ok ? 'pass' : 'FAIL'}`,
      );
      if (!ok) {
        failures.push(`${name}: ${value.toFixed(3)}ms exceeds absolute budget ${ABSOLUTE_BUDGET_MS}ms`);
      }
      return;
    }
    const ratio = value / base;
    const status = ratio <= limit ? 'pass' : 'FAIL';
    lines.push(
      `${name} | ${base.toFixed(3)} | ${value.toFixed(3)} | ${(ratio * 100).toFixed(1)}% | ${status}`,
    );
    if (ratio > (hardLimit ?? limit)) {
      failures.push(`${name}: ${(ratio * 100).toFixed(1)}% exceeds ${(hardLimit ?? limit) * 100}%`);
    }
  }

  for (const query of COLD_QUERIES) {
    checkRow(
      `cold query "${query}"`,
      baseline.cold[query],
      current.cold[query],
      1.1,
      1.25,
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
  checkRow('mount one picker', baseline.mount.one, current.mount.one, 1.1, 1.1);
  checkRow('mount ten pickers', baseline.mount.ten, current.mount.ten, 1.1, 1.1);

  if (
    current.baseBuildsForTenMounts !== null &&
    current.baseBuildsForTenMounts !== undefined
  ) {
    const ok = current.baseBuildsForTenMounts === 0;
    lines.push(
      `additional base builds for ten mounts | 0 | ${current.baseBuildsForTenMounts} | ${ok ? 'pass' : 'FAIL'}`,
    );
    if (!ok) {
      failures.push('ten same-dataset mounts rebuilt the base index');
    }
  }

  console.log(lines.join('\n'));
  return failures;
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
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
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

main();
