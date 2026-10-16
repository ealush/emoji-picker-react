import { createRequire } from 'node:module';
const scriptRunner = createRequire(import.meta.url).resolve('tsx/cli');
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';

it('derives both locale twins from the JSON dataset, idempotently', () => {
  const root = mkdtempSync(join(tmpdir(), 'epr-locale-twins-'));
  try {
    for (const dir of ['scripts', 'dist/data'])
      mkdirSync(join(root, dir), { recursive: true });
    for (const file of [
      'package.json',
      'buildDataTwins.ts',
      'bundleDeclarations.ts',
    ])
      copyFileSync(join('scripts', file), join(root, 'scripts', file));
    symlinkSync(resolve('node_modules'), join(root, 'node_modules'), 'dir');
    const js = join(root, 'dist/data/emojis-en.js');
    const mjs = join(root, 'dist/data/emojis-en.mjs');
    const json = join(root, 'dist/data/emojis-en.json');
    // tsc output for the locale module; the twins replace it.
    writeFileSync(js, 'export default { marker: "compiled" };\n');
    writeFileSync(json, '{ "marker": "first" }\n');
    writeFileSync(
      join(root, 'dist/data/emojis-en.d.ts'),
      'declare const data: { marker: string }; export default data;\n',
    );
    const run = () =>
      execFileSync(
        process.execPath,
        [scriptRunner, join(root, 'scripts/buildDataTwins.ts')],
        { stdio: 'pipe' },
      );
    const markers = () =>
      execFileSync(
        process.execPath,
        [
          '-e',
          'Promise.all([import(process.argv[1]), Promise.resolve(require(process.argv[2]))]).then(([esm,cjs]) => console.log(esm.default.marker, cjs.default.marker))',
          mjs,
          js,
        ],
        { encoding: 'utf8' },
      ).trim();

    run();
    const first = {
      mjs: readFileSync(mjs, 'utf8'),
      js: readFileSync(js, 'utf8'),
    };
    // The ESM twin is the compact dataset literal; the CommonJS twin holds
    // no copy of the data, only a require of its own JSON.
    expect(first.mjs).toBe(
      'const data = {"marker":"first"};\nexport default data;\n',
    );
    expect(first.js).toContain('require("./emojis-en.json")');
    expect(first.js).not.toContain('first');
    expect(markers()).toBe('first first');

    run();
    expect(readFileSync(mjs, 'utf8')).toBe(first.mjs);
    expect(readFileSync(js, 'utf8')).toBe(first.js);

    writeFileSync(json, '{ "marker": "second" }\n');
    run();
    expect(markers()).toBe('second second');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
