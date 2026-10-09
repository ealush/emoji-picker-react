// Build with the contributor toolchain, then execute the real tarball on the consumer floor.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { compileFixture } from '../compileFixture.js';

const root = join(__dirname, '../..');
const scratch = mkdtempSync(join(tmpdir(), 'epr-node18-'));
console.log(`Node18 fixture scratch dir: ${scratch}`);
writeFileSync(
  join(scratch, 'package.json'),
  JSON.stringify({ name: 'epr-node18-fixture', private: true }),
);
const run = (command: string, args: string[], cwd = scratch) =>
  execFileSync(command, args, { cwd, stdio: 'inherit' });
run(
  'npm',
  ['pack', '--ignore-scripts', '--quiet', '--pack-destination', scratch],
  root,
);
const tarball = readdirSync(scratch).find((file) => file.endsWith('.tgz'));
assert(tarball, 'npm pack did not produce a tarball');
run('npm', [
  'install',
  '--no-audit',
  '--no-fund',
  '--no-save',
  join(scratch, tarball),
  'node@18.20.8',
  'react@19',
  'react-dom@19',
]);
const node18 = join(scratch, 'node_modules/node/bin/node');
assert.match(
  execFileSync(node18, ['--version'], { encoding: 'utf8' }),
  /^v18\./,
);
for (const [source, output, format] of [
  ['consumer.cts', 'consumer.cjs', 'cjs'],
  ['consumer.mts', 'consumer.mjs', 'esm'],
] as const) {
  compileFixture(join(__dirname, source), join(scratch, output), format);
  run(node18, [join(scratch, output)]);
}
console.log('Node18 packed CJS/ESM + SSR consumers passed');
