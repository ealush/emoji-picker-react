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

it('preserves locale ESM twins on reruns and refreshes them after recompilation', () => {
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
    writeFileSync(js, 'export default { marker: "first" };\n');
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
    run();
    const first = readFileSync(mjs, 'utf8');
    run();
    expect(readFileSync(mjs, 'utf8')).toBe(first);
    const check = execFileSync(
      process.execPath,
      [
        '-e',
        'Promise.all([import(process.argv[1]), Promise.resolve(require(process.argv[2]))]).then(([esm,cjs]) => console.log(esm.default.marker, cjs.default.marker))',
        mjs,
        js,
      ],
      { encoding: 'utf8' },
    );
    expect(check.trim()).toBe('first first');
    writeFileSync(js, 'export default { marker: "second" };\n');
    run();
    expect(readFileSync(mjs, 'utf8')).toContain('"second"');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
