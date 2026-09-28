// Subpath entry-point builds (IMPLEMENTATION_PLAN.md Phase 7).
//
// tsdx builds only the main entry. This script bundles the additive v5
// entries with esbuild and emits their TypeScript declarations with tsc:
// - emoji-picker-react/primitives -> dist/primitives/index.{js,mjs,d.ts}
// - emoji-picker-react/data       -> dist/data/index.{js,mjs,d.ts}
//   (the default dataset is intentionally included in the data bundle;
//   locale datasets stay separate files so one import never pulls all).
//
// react/react-dom/shipstyles stay external (peer/dependency). SVG assets
// bundle as data URIs, matching the main build's base64 behavior.
// Run: npm run build:entries (after the main build, so dist/ exists).
// Requires network access only if esbuild is not already installed.
const { spawnSync } = require('child_process');
const { copyFileSync, existsSync } = require('fs');
const { join } = require('path');

const repoRoot = join(__dirname, '..');
const esbuildBin = join(repoRoot, 'node_modules', '.bin', 'esbuild');

function sh(command, args, options) {
  const result = spawnSync(command, args, { stdio: 'inherit', ...options });
  if (result.status !== 0) {
    throw new Error(`command failed: ${command} ${args.join(' ')}`);
  }
}

// Bundle an entry's declaration closure into a single self-contained
// .d.ts. Extensionless relative imports fail strictly under node16-ESM
// resolution, so multi-file declarations cannot ship as-is.
async function bundleDeclarations(entryDts) {
  const { rollup } = require('rollup');
  const dts = require('rollup-plugin-dts').default;
  const { writeFileSync } = require('fs');
  const bundle = await rollup({
    input: entryDts,
    plugins: [dts()],
    onwarn() {},
  });
  const { output } = await bundle.generate({ format: 'es' });
  writeFileSync(entryDts, output[0].code);
}

async function main() {
  if (!existsSync(esbuildBin)) {
    throw new Error(
      'esbuild binary not found at node_modules/.bin/esbuild. ' +
        'Run npm install (network required), then retry.',
    );
  }

  const entries = [
    { src: 'src/primitives/index.ts', outdir: 'dist/primitives' },
    { src: 'src/data.ts', outdir: 'dist/data' },
  ];

  for (const { src, outdir } of entries) {
    // CJS for require() consumers.
    sh(esbuildBin, [
      join(repoRoot, src),
      '--bundle',
      '--format=cjs',
      '--platform=node',
      '--target=node14',
      '--external:react',
      '--external:react-dom',
      '--external:shipstyles',
      '--loader:.svg=dataurl',
      `--outfile=${join(repoRoot, outdir, 'index.js')}`,
      '--log-level=warning',
    ]);
    // ESM (.mjs, unambiguous in a CommonJS-typed package) for importers.
    sh(esbuildBin, [
      join(repoRoot, src),
      '--bundle',
      '--format=esm',
      '--platform=neutral',
      '--target=es2019',
      '--external:react',
      '--external:react-dom',
      '--external:shipstyles',
      '--loader:.svg=dataurl',
      `--outfile=${join(repoRoot, outdir, 'index.mjs')}`,
      '--log-level=warning',
    ]);
  }

  // Declarations for both entries (and only their closure). tsc emits
  // .d.ts even when it reports environmental errors (missing svg shims
  // are included above; third-party private-name noise like TS4058 does
  // not affect output). Strict type safety is gated separately by
  // `npm run type-check`, so here we verify the expected outputs exist.
  const tsc = spawnSync(
    'npx',
    ['tsc', '--project', join(repoRoot, 'scripts', 'tsconfig.entries.json')],
    { stdio: 'inherit', cwd: repoRoot },
  );
  // tsc emits declarations following the source layout: index-file
  // entries land next to their bundles (dist/primitives/index.d.ts),
  // while the top-level data entry emits dist/data.d.ts — which is where
  // the exports map points its types condition. No relocation: moving
  // declaration files would invalidate their relative specifiers.
  const expected = [
    join('primitives', 'index.d.ts'),
    'data.d.ts',
  ];
  const missing = expected
    .map((file) => join(repoRoot, 'dist', file))
    .filter((path) => !existsSync(path));
  if (missing.length > 0 || tsc.status !== 0) {
    console.warn(
      `declaration emit finished with tsc status ${tsc.status}; ` +
        `missing: ${missing.join(', ') || 'none'}`,
    );
  }
  if (missing.length > 0) {
    throw new Error(
      `entry declarations missing: ${missing.join(', ')}`,
    );
  }
  // ESM-typed twins for the .mjs implementations: identical content, but
  // the .d.mts extension lets resolvers see ESM types (otherwise the ESM
  // entry "masquerades as CJS" per @arethetypeswrong).
  // Bundle each entry's declaration closure into a single self-contained
  // file (see bundleDeclarations), then mint the ESM-typed twins.
  await bundleDeclarations(
    join(repoRoot, 'dist', 'primitives', 'index.d.ts'),
  );
  await bundleDeclarations(join(repoRoot, 'dist', 'data.d.ts'));
  copyFileSync(
    join(repoRoot, 'dist', 'primitives', 'index.d.ts'),
    join(repoRoot, 'dist', 'primitives', 'index.d.mts'),
  );
  copyFileSync(
    join(repoRoot, 'dist', 'data.d.ts'),
    join(repoRoot, 'dist', 'data.d.mts'),
  );
  // Main-entry ESM twin: tsdx emits dist/emoji-picker-react.esm.js with
  // ESM syntax, which Node refuses to load as .js under the package's
  // explicit CommonJS type. The .mjs twin is byte-identical but
  // unambiguous, matching the primitives/data dual-entry convention.
  // The exports map points the import condition at the twin; the .js
  // original stays for bundlers and size-limit.
  const mainEsm = join(repoRoot, 'dist', 'emoji-picker-react.esm.js');
  if (existsSync(mainEsm)) {
    copyFileSync(mainEsm, join(repoRoot, 'dist', 'emoji-picker-react.esm.mjs'));
  }
  // ESM-typed twin for the main declarations: index.d.ts resolves as
  // CommonJS under the package type, so the ESM condition needs ESM-typed
  // declarations to agree with its .mjs implementation (same trick as the
  // primitives/data twins above). Bundle first: the tsdx-emitted
  // index.d.ts carries extensionless relative imports, which fail
  // strictly under node16-ESM resolution.
  const mainDts = join(repoRoot, 'dist', 'index.d.ts');
  if (existsSync(mainDts)) {
    await bundleDeclarations(mainDts);
    copyFileSync(mainDts, join(repoRoot, 'dist', 'index.d.mts'));
  }
  console.log('entry builds complete: dist/primitives, dist/data');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
