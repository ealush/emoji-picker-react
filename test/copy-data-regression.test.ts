import { createRequire } from 'node:module';
const scriptRunner = createRequire(import.meta.url).resolve('tsx/cli');
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';

it('removes stale internal sources without removing compiled data', () => {
  const root = mkdtempSync(join(tmpdir(), 'epr-copy-data-'));
  try {
    for (const dir of ['scripts', 'src/data', 'dist/data'])
      mkdirSync(join(root, dir), { recursive: true });
    copyFileSync('scripts/package.json', join(root, 'scripts/package.json'));
    copyFileSync('scripts/copyData.ts', join(root, 'scripts/copyData.ts'));
    for (const name of ['defaultEmojiData.ts', 'registerDefaultEmojiData.ts']) {
      writeFileSync(join(root, 'src/data', name), 'internal source');
      writeFileSync(join(root, 'dist/data', name), 'stale internal source');
    }
    writeFileSync(
      join(root, 'dist/data/defaultEmojiData.js'),
      'compiled module',
    );
    writeFileSync(join(root, 'src/data/emojis-en.json'), '{"en":true}');
    execFileSync(process.execPath, [
      scriptRunner,
      join(root, 'scripts/copyData.ts'),
    ]);
    expect(existsSync(join(root, 'dist/data/defaultEmojiData.ts'))).toBe(false);
    expect(
      existsSync(join(root, 'dist/data/registerDefaultEmojiData.ts')),
    ).toBe(false);
    expect(
      readFileSync(join(root, 'dist/data/defaultEmojiData.js'), 'utf8'),
    ).toBe('compiled module');
    expect(readFileSync(join(root, 'dist/data/emojis-en.json'), 'utf8')).toBe(
      '{"en":true}',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
