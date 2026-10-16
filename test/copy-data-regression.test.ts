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

it('ships datasets as JSON only and removes stale raw sources', () => {
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
    // Generated dataset modules are compiled by tsc, never copied raw: a .ts
    // beside its .d.ts wins declaration resolution in consumers.
    writeFileSync(join(root, 'src/data/emojis-en.ts'), 'dataset source');
    writeFileSync(join(root, 'dist/data/emojis-de.ts'), 'stale dataset source');
    writeFileSync(join(root, 'dist/data/emojis-de.d.ts'), 'declarations');
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
    expect(existsSync(join(root, 'dist/data/emojis-en.ts'))).toBe(false);
    expect(existsSync(join(root, 'dist/data/emojis-de.ts'))).toBe(false);
    expect(readFileSync(join(root, 'dist/data/emojis-de.d.ts'), 'utf8')).toBe(
      'declarations',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
