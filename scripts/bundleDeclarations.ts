import { writeFileSync } from 'node:fs';
// Shared declaration bundler for published entry points.
//
// Extensionless relative imports fail strictly under node16-ESM
// resolution, so multi-file declarations cannot ship as-is. This bundles
// an entry's declaration closure into a single self-contained .d.ts/.d.mts
// (used by build.ts for the main/primitives/data entries and by
// buildDataTwins.ts for the locale .d.mts twins).
async function bundleDeclarations(entryDts: string) {
  const { rollup } = await import('rollup');
  const { dts } = await import('rollup-plugin-dts');
  const bundle = await rollup({
    input: entryDts,
    plugins: [dts()],
    onwarn() {},
  });
  try {
    const { output } = await bundle.generate({ format: 'es' });
    writeFileSync(entryDts, output[0].code);
  } finally {
    await bundle.close();
  }
}

export { bundleDeclarations };
