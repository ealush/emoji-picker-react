// Locale dataset dual-format twins (package-check gate).
//
// dist/data/emojis-*.js ships ESM syntax from tsc, which Node refuses to
// load through require() under the package's explicit CommonJS type —
// and compiling the data as CJS instead breaks ESM namespace imports
// (the single default export double-wraps). So each locale ships both:
// - .mjs: byte copy of the tsc ESM output, unambiguous for importers;
// - .js:  esbuild CJS conversion, unambiguous for require() consumers
//         (whose `canonical.default ?? canonical` access resolves the
//         single default export).
// The exports map points each condition at its twin. Declarations are
// twinned too (.d.mts alongside .d.ts): a shared CJS-flavored .d.ts binds
// ESM default-imports to the module namespace instead of the dataset, so
// each condition resolves its own declarations (bundled self-contained,
// like the main/primitives/data entries).
// Run: node ./scripts/buildDataTwins.js (after build:data:dist emits the
// tsc ESM files, before packing).
const { spawnSync } = require('child_process');
const { copyFileSync, existsSync, readdirSync } = require('fs');
const { join } = require('path');

const { bundleDeclarations } = require('./bundleDeclarations');

const repoRoot = join(__dirname, '..');
const esbuildBin = join(repoRoot, 'node_modules', '.bin', 'esbuild');

function sh(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`command failed: ${command} ${args.join(' ')}`);
  }
}

async function main() {
  if (!existsSync(esbuildBin)) {
    throw new Error(
      'esbuild binary not found at node_modules/.bin/esbuild. ' +
        'Run npm install (network required), then retry.',
    );
  }

  const dataDir = join(repoRoot, 'dist', 'data');
  const locales = readdirSync(dataDir).filter(
    (file) =>
      file.startsWith('emojis-') &&
      file.endsWith('.js') &&
      !file.endsWith('.mjs'),
  );
  if (locales.length === 0) {
    throw new Error(
      'no locale datasets found in dist/data; run build:data:dist first.',
    );
  }

  for (const file of locales) {
    const esm = join(dataDir, file);
    const mjs = esm.replace(/\.js$/, '.mjs');
    // ESM twin first: the conversion below overwrites the .js in place.
    copyFileSync(esm, mjs);
    sh(esbuildBin, [
      mjs,
      '--format=cjs',
      '--platform=node',
      '--target=node14',
      `--outfile=${esm}`,
      '--log-level=warning',
    ]);
    // ESM-typed declarations twin: bundle the .d.ts self-contained
    // first (inlining the extensionless relative type import, which is
    // illegal in .d.mts), then mint the twin as a copy. The dts plugin
    // only accepts .d.ts inputs, hence this order; bundling also makes
    // the CJS-side declarations robust.
    const dts = esm.replace(/\.js$/, '.d.ts');
    const dmts = esm.replace(/\.js$/, '.d.mts');
    await bundleDeclarations(dts);
    copyFileSync(dts, dmts);
  }
  console.log(`locale twins complete: ${locales.length} datasets dualized`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
