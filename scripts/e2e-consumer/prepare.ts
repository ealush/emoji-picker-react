// Packed-consumer e2e fixture.
//
// Packs the real publishable tarball, installs it with React 19 into a
// scratch directory under the OS temp dir (never inside the repository, so
// no import can fall back to the repository's node_modules), and builds the
// consumer app in ./app twice:
// - Vite (ESM `import` condition, code-split locale chunk);
// - esbuild IIFE from require() calls (CommonJS `require` condition).
// serve.ts then serves the output under a strict Content Security Policy
// and playwright/packed-consumer.spec.ts drives it with video recording.
//
// Run: npm run test:e2e (build first). Requires network access for the
// scratch install.
import type { ExecFileSyncOptions } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

import { buildSync } from 'esbuild';

import { e2eConsumerDir } from './paths';

const repoRoot = join(__dirname, '..', '..');

function run(
  command: string,
  args: string[],
  options: ExecFileSyncOptions = {},
): string {
  const output = execFileSync(command, args, {
    stdio: ['ignore', 'pipe', 'inherit'],
    encoding: 'utf8',
    ...options,
  });
  // Inherited stdio returns null; only piped calls are read.
  return output ? output.toString() : '';
}

type PackEntry = {
  filename: string;
  size: number;
  unpackedSize: number;
  entryCount: number;
  version: string;
};

function isPackEntry(value: unknown): value is PackEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.filename === 'string' &&
    typeof entry.size === 'number' &&
    typeof entry.unpackedSize === 'number' &&
    typeof entry.entryCount === 'number' &&
    typeof entry.version === 'string'
  );
}

function main() {
  if (!existsSync(join(repoRoot, 'dist', 'esm', 'index.mjs'))) {
    throw new Error(
      'e2e consumer requires built artifacts; run `npm run build` first.',
    );
  }

  const scratch = e2eConsumerDir();
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  console.log(`e2e consumer scratch dir: ${scratch}`);

  const packed: unknown = JSON.parse(
    run(
      'npm',
      ['pack', '--json', '--pack-destination', scratch, '--ignore-scripts'],
      { cwd: repoRoot },
    ),
  );
  const pack = Array.isArray(packed) ? packed[0] : undefined;
  if (!isPackEntry(pack))
    throw new Error('unexpected `npm pack --json` output');

  writeFileSync(
    join(scratch, 'package.json'),
    JSON.stringify({ name: 'epr-e2e-consumer', private: true }),
  );
  run(
    'npm',
    [
      'install',
      '--no-audit',
      '--no-fund',
      '--no-save',
      '--ignore-scripts',
      join(scratch, pack.filename),
      'react@19',
      'react-dom@19',
    ],
    { cwd: scratch, stdio: 'inherit' },
  );

  const appDir = join(scratch, 'app');
  const outDir = join(scratch, 'dist');
  cpSync(join(__dirname, 'app'), appDir, { recursive: true });

  // The repository's Vite builds the scratch app; every import resolves
  // from the scratch install because the sources live there. The config is
  // a plain object so it needs no import from the scratch directory.
  const viteConfig = join(scratch, 'vite.config.mjs');
  writeFileSync(
    viteConfig,
    `export default ${JSON.stringify({
      root: appDir,
      logLevel: 'warn',
      base: './',
      oxc: { jsx: { runtime: 'automatic' } },
      build: { outDir, emptyOutDir: true },
    })};\n`,
  );
  run(
    join(repoRoot, 'node_modules', '.bin', 'vite'),
    ['build', '--config', viteConfig],
    {
      cwd: scratch,
      stdio: 'inherit',
    },
  );

  buildSync({
    entryPoints: [join(appDir, 'cjs.tsx')],
    outfile: join(outDir, 'cjs.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    jsx: 'automatic',
    minify: true,
    define: { 'process.env.NODE_ENV': '"production"' },
    // No repository path aliases: resolve the packed dependency only.
    tsconfigRaw: { compilerOptions: {} },
    logLevel: 'warning',
  });
  copyFileSync(join(appDir, 'cjs.html'), join(outDir, 'cjs.html'));

  writeFileSync(
    join(outDir, 'e2e-manifest.json'),
    JSON.stringify({
      version: pack.version,
      tarball: pack.filename,
      packedBytes: pack.size,
      unpackedBytes: pack.unpackedSize,
      files: pack.entryCount,
    }),
  );
  console.log(
    `e2e consumer built from ${pack.filename} ` +
      `(${pack.size} B packed, ${pack.unpackedSize} B unpacked, ${pack.entryCount} files)`,
  );
}

main();
