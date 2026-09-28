// React 16.8 fixture runner (docs/v5/REACT_COMPATIBILITY.md §2, Phase 4).
//
// Builds a CJS bundle of the current src with esbuild, installs
// react@16.8 + react-dom@16.8 + jsdom into a scratch directory under the
// OS temp dir (never inside the repo), and runs react16-check.js against
// it: mount/unmount, click selection, keyboard smoke path, SSR render,
// hydration, and zero library-owned DOM IDs.
//
// Run: npm run check:react16
// Requires network access for the fixture install (and for esbuild if it
// is not already resolvable via npx).
const { execFileSync } = require('child_process');
const { copyFileSync, mkdtempSync, writeFileSync } = require('fs');
const { tmpdir } = require('os');
const { join } = require('path');

const repoRoot = join(__dirname, '..', '..');
const REACT16 = '16.8.6';

function run(command, args, options) {
  execFileSync(command, args, { stdio: 'inherit', ...options });
}

function main() {
  const scratch = mkdtempSync(join(tmpdir(), 'epr-react16-'));
  console.log(`react16 fixture scratch dir: ${scratch}`);

  writeFileSync(
    join(scratch, 'package.json'),
    JSON.stringify({ name: 'epr-react16-fixture', private: true }),
  );
  run('npm', [
    'install',
    '--no-audit',
    '--no-fund',
    '--no-save',
    `react@${REACT16}`,
    `react-dom@${REACT16}`,
    'jsdom@24',
  ], { cwd: scratch });

  const bundle = join(scratch, 'picker.cjs');
  run(
    'npx',
    [
      '-y',
      'esbuild',
      join(repoRoot, 'src', 'index.tsx'),
      '--bundle',
      '--format=cjs',
      '--platform=node',
      '--external:react',
      '--external:react-dom',
      '--loader:.svg=text',
      `--outfile=${bundle}`,
      '--log-level=warning',
    ],
    { cwd: repoRoot },
  );

  // The check script must live inside the scratch dir so bare `react` /
  // `react-dom` / `jsdom` requires resolve to the fixture copies, never to
  // the repository's own React 18 install (module resolution follows the
  // script path, not cwd).
  const checkInScratch = join(scratch, 'react16-check.js');
  copyFileSync(join(__dirname, 'react16-check.js'), checkInScratch);
  run('node', [checkInScratch, bundle], {
    cwd: scratch,
  });
  console.log('react16 fixture: bundle + consumer checks passed');
}

main();
