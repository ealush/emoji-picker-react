import process from 'node:process';
// Locale dataset dual-format twins (package-check gate).
//
// Each locale ships its dataset once as JSON (dist/data/emojis-*.json,
// copied by copyData.ts) and once as an ES module, with a one-line
// CommonJS twin between them:
// - .mjs: the JSON text as a compact module literal, for importers (Node
//         ESM cannot import JSON portably across Node 18 and bundlers);
// - .js:  `exports.default = require("./emojis-*.json")`, for require()
//         consumers (Node, webpack, Jest and Metro load JSON natively;
//         `canonical.default ?? canonical` access resolves the dataset).
// The exports map points each condition at its twin. Declarations are
// twinned too (.d.mts alongside .d.ts): a shared CJS-flavored .d.ts binds
// ESM default-imports to the module namespace instead of the dataset, so
// each condition resolves its own declarations (bundled self-contained,
// like the main/primitives/data entries).
// Run: tsx ./scripts/buildDataTwins.ts (after build:data:dist emits the
// declarations and copies the JSON, before packing).
import {
  copyFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';

import { bundleDeclarations } from './bundleDeclarations.js';

const repoRoot = join(__dirname, '..');

function commonJsTwin(json: string): string {
  return [
    '"use strict";',
    '// The dataset is the sibling JSON file (scripts/buildDataTwins.ts).',
    'Object.defineProperty(exports, "__esModule", { value: true });',
    `exports.default = require("./${json}");`,
    '',
  ].join('\n');
}

async function main() {
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
    const json = esm.replace(/\.js$/, '.json');
    if (!existsSync(json)) {
      throw new Error(`${basename(json)} missing; run build:data:dist first.`);
    }
    // Valid JSON text is a valid ES2020 expression; parsing first fails
    // the build on a corrupt dataset and normalizes to the compact form.
    const dataset = JSON.stringify(JSON.parse(readFileSync(json, 'utf8')));
    writeFileSync(
      esm.replace(/\.js$/, '.mjs'),
      `const data = ${dataset};\nexport default data;\n`,
    );
    writeFileSync(esm, commonJsTwin(basename(json)));
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
