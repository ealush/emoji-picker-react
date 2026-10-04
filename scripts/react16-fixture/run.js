// React 16.8 fixture runner (docs/v5/REACT_COMPATIBILITY.md §2, Phase 4).
//
// Installs the actual tarball with
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
  // Install the actual publishable artifact, not a source-only bundle.
  run('npm', ['pack', '--pack-destination', scratch, '--ignore-scripts', '--quiet'], { cwd: repoRoot });
  const tarball = require('fs').readdirSync(scratch).find(file => file.endsWith('.tgz'));
  run('npm', ['install', '--no-audit', '--no-fund', '--no-save',
    join(scratch, tarball), `react@${REACT16}`, `react-dom@${REACT16}`, 'jsdom@24'], { cwd: scratch });

  // The check script must live inside the scratch dir so bare `react` /
  // `react-dom` / `jsdom` requires resolve to the fixture copies, never to
  // the repository's own React 18 install (module resolution follows the
  // script path, not cwd).
  const checkInScratch = join(scratch, 'react16-check.js');
  copyFileSync(join(__dirname, 'react16-check.js'), checkInScratch);
  run('node', [checkInScratch, 'emoji-picker-react'], {
    cwd: scratch,
  });
  console.log('react16 fixture: packed consumer checks passed');
}

main();
