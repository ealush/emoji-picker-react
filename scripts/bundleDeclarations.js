// Shared declaration bundler for published entry points.
//
// Extensionless relative imports fail strictly under node16-ESM
// resolution, so multi-file declarations cannot ship as-is. This bundles
// an entry's declaration closure into a single self-contained .d.ts/.d.mts
// (used by build.js for the main/primitives/data entries and by
// buildDataTwins.js for the locale .d.mts twins).
async function bundleDeclarations(entryDts) {
  const { rollup } = require('rollup');
  const { dts } = require('rollup-plugin-dts');
  const { writeFileSync } = require('fs');
  const bundle = await rollup({
    input: entryDts,
    plugins: [dts()],
    onwarn() {},
  });
  const { output } = await bundle.generate({ format: 'es' });
  writeFileSync(entryDts, output[0].code);
}

module.exports = { bundleDeclarations };
