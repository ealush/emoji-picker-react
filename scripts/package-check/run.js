// Packed package checks (IMPLEMENTATION_PLAN.md Phase 7).
//
// Validates the REAL packed output (run after `npm run build`):
// - main / primitives / data / locale subpaths resolve (CJS + ESM) with
//   declarations present;
// - importing primitives does not drag in the default appearance wrapper
//   (bundle marker scan);
// - the data entry does not import React or ShipStyles (load test with
//   framework resolution blocked + static scan);
// - deprecated v4 `dist/data/emojis-*` deep paths keep working;
// - the raw `src/data/*.json` datasets real consumers import stay reachable;
// - publint and @arethetypeswrong pass on the tarball.
//
// Run: npm run check:package
// Requires network access for the scratch install and for publint/attw
// when they are not already installed.
const { spawnSync } = require('child_process');
const { copyFileSync, existsSync, mkdtempSync, writeFileSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const repoRoot = join(__dirname, '..', '..');

function sh(command, args, options) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    throw new Error(`command failed: ${command} ${args.join(' ')}`);
  }
}

const REQUIRED = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/index.d.mts',
  'dist/esm/index.mjs',
  'dist/esm/primitives/index.mjs',
  'dist/esm/data.mjs',
  'dist/primitives/index.js',
  'dist/primitives/index.d.ts',
  'dist/data/index.js',
  'dist/data.d.ts',
  'dist/data/emojis-es.js',
  'dist/data/emojis-es.mjs',
  'dist/data/emojis-es.d.ts',
  'dist/data/emojis-es.d.mts',
];

function main() {
  const missing = REQUIRED.map((file) => join(repoRoot, file)).filter(
    (path) => !existsSync(path),
  );
  if (missing.length > 0) {
    throw new Error(
      'package check requires built artifacts; run `npm run build` first. ' +
        `Missing: ${missing.join(', ')}`,
    );
  }

  const scratch = mkdtempSync(join(tmpdir(), 'epr-package-check-'));
  console.log(`package check scratch dir: ${scratch}`);

  // Pack the real package (respects files[] + exports map).
  sh('npm', ['pack', '--pack-destination', scratch, '--ignore-scripts', '--quiet'], { cwd: repoRoot });
  const tarball = require('fs')
    .readdirSync(scratch)
    .map((entry) => join(scratch, entry))
    .find((entry) => entry.endsWith('.tgz'));
  if (!tarball) {
    throw new Error('npm pack produced no tarball');
  }

  writeFileSync(
    join(scratch, 'package.json'),
    JSON.stringify({ name: 'epr-package-check', private: true }),
  );
  sh(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--no-save',
      tarball,
      'react@19',
      'react-dom@19',
      'jsdom@24',
    ],
    { cwd: scratch },
  );

  const bundleDir = checkPrimitivesInitialBudget(scratch);
  const mainBundleDir = bundleDefaultConsumer(scratch);
  copyFileSync(join(__dirname, 'primitives-bundle-check.mjs'), join(scratch, 'primitives-bundle-check.mjs'));
  sh('node', [join(scratch, 'primitives-bundle-check.mjs'), join(bundleDir, 'entry.mjs')], { cwd: scratch });
  sh('node', [join(scratch, 'primitives-bundle-check.mjs'), join(mainBundleDir, 'entry.mjs'), 'default'], { cwd: scratch });

  for (const file of ['consumer-check.cjs', 'consumer-check.mjs']) {
    copyFileSync(join(__dirname, file), join(scratch, file));
  }
  sh('node', [join(scratch, 'consumer-check.cjs')], { cwd: scratch });
  sh('node', [join(scratch, 'consumer-check.mjs')], { cwd: scratch });

  // Package-shape validators on the tarball itself.
  sh('npx', ['-y', 'publint', tarball], { cwd: scratch });
  gateAttw(tarball, scratch);

  console.log('package check: all packed consumer checks passed');
}

// @arethetypeswrong gate with a pre-existing-issue allowlist.
//
// New v5 entries must be fully clean under node16 (CJS + ESM) and
// bundler; node10 (legacy, exports-unaware) may only report NoResolution
// for them. The main entry must be clean in every mode.
// size-limit inlines dynamic imports, so it reports the primitives entry
// with its lazily loaded dataset. This budget measures what a consumer
// bundle actually loads up front: the entry plus its static chunks,
// minified and gzipped, with the dataset left in its own lazy chunk.
// The original adoption consumer was 40.5 KiB including ShipStyles.
// Unused part/style factories now tree-shake: keep the complete measurement
// and enforce a 34 KiB cap against the installed tarball's public entry.
const PRIMITIVES_INITIAL_BUDGET_BYTES = 34 * 1024;

function checkPrimitivesInitialBudget(scratch) {
  const { gzipSync } = require('zlib');
  const { readFileSync, readdirSync } = require('fs');
  const out = mkdtempSync(join(scratch, 'primitives-budget-'));
  const consumer = join(out, 'consumer.tsx');
  writeFileSync(consumer, `import * as React from 'react';
import { Root, SearchInput, Viewport, List, Loading, LoadError, Empty, SkinTonePickerLocation } from 'emoji-picker-react/primitives';
export const Picker = props => <Root skinTonePickerLocation={SkinTonePickerLocation.NONE} {...props}><SearchInput /><Viewport><List /><Loading /><LoadError /><Empty /></Viewport></Root>;`);
  sh(join(repoRoot, 'node_modules', '.bin', 'esbuild'), [
    consumer,
    '--define:process.env.NODE_ENV="production"',
    '--bundle',
    '--splitting',
    '--format=esm',
    '--minify',
    '--external:react',
    '--external:react-dom',
    '--entry-names=entry',
    '--out-extension:.js=.mjs',
    `--outdir=${out}`,
    '--log-level=error',
  ]);
  const files = new Map(
    readdirSync(out).map((name) => [name, readFileSync(join(out, name), 'utf8')]),
  );
  const initial = new Set();
  const visit = (name) => {
    if (initial.has(name) || !files.has(name)) return;
    initial.add(name);
    const staticImport = /(?:import|from)\s*["']\.\/([^"']+)["']/g;
    let match;
    while ((match = staticImport.exec(files.get(name)))) visit(match[1]);
  };
  visit('entry.mjs');
  const bytes = [...initial].reduce(
    (sum, name) => sum + gzipSync(files.get(name)).length,
    0,
  );
  const kb = (bytes / 1024).toFixed(1);
  if (bytes > PRIMITIVES_INITIAL_BUDGET_BYTES) {
    throw new Error(
      `primitives initial load ${kb} KB exceeds ${PRIMITIVES_INITIAL_BUDGET_BYTES / 1024} KB (min+gz)`,
    );
  }
  const eager = [...initial].some(name => files.get(name).includes('grinning face with big eyes'));
  if (eager) throw new Error('primitives + runtime constants eagerly include the dataset');
  const runtime = [...initial].map(name => files.get(name)).join('\n');
  for (const marker of ['M12.8,9.5c0.6', 'epr-btn-clear-search', 'epr-preview-default-emoji']) {
    if (runtime.includes(marker)) throw new Error(`minimal consumer retains unused presentation: ${marker}`);
  }
  console.log(`ok: primitives + constants initial load ${kb} KiB min+gz (ShipStyles included; dataset lazy)`);
  return out;
}

function bundleDefaultConsumer(scratch) {
  const out = mkdtempSync(join(scratch, 'default-bundle-'));
  const consumer = join(out, 'consumer.tsx');
  writeFileSync(consumer, `import * as React from 'react';
import EmojiPicker from 'emoji-picker-react';
export const Picker = props => <EmojiPicker {...props} />;`);
  sh(join(repoRoot, 'node_modules', '.bin', 'esbuild'), [
    consumer, '--define:process.env.NODE_ENV="production"', '--bundle',
    '--splitting', '--format=esm', '--minify', '--external:react',
    '--external:react-dom', '--entry-names=entry', '--out-extension:.js=.mjs',
    `--outdir=${out}`, '--log-level=error',
  ]);
  return out;
}

function gateAttw(tarball, cwd) {
  // attw shells out to npm internally; it must run from the repository
  // checkout, not the scratch install dir. Its JSON report is redirected
  // to a file: pipe capture truncates large reports on some platforms.
  const reportPath = join(cwd, 'attw-report.json');
  const redirected = spawnSync(
    'sh',
    [
      '-c',
      `npx -y @arethetypeswrong/cli --pack ${JSON.stringify(tarball)} -f json > ${JSON.stringify(reportPath)}`,
    ],
    { cwd: repoRoot, encoding: 'utf8' },
  );
  let stdout = '';
  try {
    stdout = require('fs').readFileSync(reportPath, 'utf8');
  } catch (error) {
    throw new Error(
      `attw wrote no JSON report (status ${redirected.status}): ${error.message}`,
    );
  }
  let analysis;
  try {
    analysis = JSON.parse(stdout).analysis;
  } catch (error) {
    throw new Error(
      `attw produced no JSON report (status ${redirected.status}): ` +
        error.message,
    );
  }
  const problems = analysis.problems ?? {};
  const failures = [];
  const kindsOf = (entrypoint, resolution) => {
    const resolutions = analysis.entrypoints?.[entrypoint]?.resolutions ?? {};
    const ids = resolutions[resolution]?.visibleProblems ?? [];
    return ids.map((id) => problems[String(id)]?.kind ?? `unknown:${id}`);
  };

  for (const entrypoint of ['./primitives', './data']) {
    for (const resolution of ['node16-cjs', 'node16-esm', 'bundler']) {
      for (const kind of kindsOf(entrypoint, resolution)) {
        failures.push(`${entrypoint} ${resolution}: ${kind}`);
      }
    }
    for (const kind of kindsOf(entrypoint, 'node10')) {
      if (kind !== 'NoResolution') {
        failures.push(`${entrypoint} node10: ${kind}`);
      }
    }
  }

  // The main entry supports every resolution mode, node10 included.
  for (const resolution of ['node10', 'node16-cjs', 'node16-esm', 'bundler']) {
    for (const kind of kindsOf('.', resolution)) {
      failures.push(`main entry ${resolution}: ${kind}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      'attw gate failed:\n  - ' + failures.join('\n  - '),
    );
  }
  console.log('ok: attw gate (all entries clean)');
}

main();
