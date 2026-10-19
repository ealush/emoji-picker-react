import { copyFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Datasets ship as JSON (the legacy `dist/data/emojis-*.json` paths and the
// source of each locale's module twins, buildDataTwins.ts). TypeScript
// sources are compiled, never shipped raw: a .ts beside its .d.ts would win
// declaration resolution and type-check the whole dataset in consumers.

const source = join(__dirname, '..', 'src', 'data');
const target = join(__dirname, '..', 'dist', 'data');
mkdirSync(target, { recursive: true });
// An incremental build may still hold raw sources an earlier version of this
// script copied. Remove them without deleting declarations.
readdirSync(target)
  .filter((file) => file.endsWith('.ts') && !file.endsWith('.d.ts'))
  .forEach((file) => rmSync(join(target, file), { force: true }));

readdirSync(source)
  .filter((file) => file.endsWith('.json'))
  .forEach((file) => copyFileSync(join(source, file), join(target, file)));
