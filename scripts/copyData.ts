import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Internal runtime modules are compiled, never shipped as raw sources: a
// raw .ts beside its .d.ts would win declaration resolution.
const INTERNAL = new Set([
  'defaultEmojiData.ts',
  'registerDefaultEmojiData.ts',
]);

const source = join(__dirname, '..', 'src', 'data');
const target = join(__dirname, '..', 'dist', 'data');
mkdirSync(target, { recursive: true });
// A previous incremental build may have copied these sources before they
// became internal. Remove them without deleting compiled modules/datasets.
for (const file of INTERNAL) rmSync(join(target, file), { force: true });

readdirSync(source)
  .filter((file) => /\.(json|ts)$/.test(file) && !INTERNAL.has(file))
  .forEach((file) => copyFileSync(join(source, file), join(target, file)));
