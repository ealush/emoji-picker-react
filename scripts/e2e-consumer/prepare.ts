// Packed-consumer e2e fixture.
//
// Packs the real publishable tarball, installs it with React 19 into a
// scratch directory under the OS temp dir (never inside the repository, so
// no import can fall back to the repository's node_modules), and builds the
// consumer app in ./app twice:
// - Vite (ESM `import` condition, code-split locale chunk);
// - esbuild IIFE from require() calls (CommonJS `require` condition);
// - the shadcn/ui registry component, installed by the shadcn CLI
//   (shadcn.ts).
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
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { buildSync } from 'esbuild';

import { e2eConsumerDir } from './paths';
import { buildShadcnConsumer } from './shadcn';

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

// Written into the scratch directory. A directory named by EPR_E2E_DIR is
// deleted only when it carries the marker or is empty, so a mistaken value
// cannot wipe data; the default temp dir is this script's by name.
const MARKER = '.epr-e2e-scratch';

/** Refuses any scratch path whose recursive delete could reach user data. */
function assertDisposable(scratch: string, requireMarker: boolean) {
  // Whether `child` is `parent` or lies inside it.
  const within = (parent: string, child: string) => {
    const path = relative(parent, child);
    return (
      path === '' ||
      (path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
    );
  };
  if (
    scratch === dirname(scratch) || // the filesystem root
    within(scratch, homedir()) ||
    within(scratch, repoRoot) || // the repository or an ancestor
    within(repoRoot, scratch) // inside it, imports would reach node_modules
  ) {
    throw new Error(
      `refusing to use ${scratch} as the e2e scratch dir (EPR_E2E_DIR): ` +
        'it is the filesystem root, the home directory, or the repository, ' +
        'one of their ancestors, or inside the repository.',
    );
  }
  if (
    requireMarker &&
    existsSync(scratch) &&
    readdirSync(scratch).length > 0 &&
    !existsSync(join(scratch, MARKER))
  ) {
    throw new Error(
      `refusing to delete ${scratch}: it is not empty and was not created ` +
        `by this script (no ${MARKER}). Point EPR_E2E_DIR at a new ` +
        'directory, or remove this one yourself.',
    );
  }
}

// Newest modification time under `dir`, in milliseconds.
function newestMtime(dir: string): number {
  return readdirSync(dir, { withFileTypes: true }).reduce((newest, entry) => {
    const path = join(dir, entry.name);
    const time = entry.isDirectory()
      ? newestMtime(path)
      : statSync(path).mtimeMs;
    return Math.max(newest, time);
  }, 0);
}

// npm pack runs with --ignore-scripts, so the tarball is whatever dist
// holds: fail rather than test a build older than the sources.
function assertFreshBuild() {
  const entries = [
    join(repoRoot, 'dist', 'esm', 'index.mjs'),
    join(repoRoot, 'dist', 'index.js'),
  ];
  if (!entries.every((entry) => existsSync(entry))) {
    throw new Error(
      'e2e consumer requires built artifacts; run `npm run build` first.',
    );
  }
  const built = Math.min(...entries.map((entry) => statSync(entry).mtimeMs));
  if (newestMtime(join(repoRoot, 'src')) > built) {
    throw new Error(
      'dist is older than src/; run `npm run build` before `npm run test:e2e`.',
    );
  }
}

/** The `tsx check` block in `doc` that defines `name`. */
function guideExample(doc: string, name: string): string {
  const markdown = readFileSync(join(repoRoot, doc), 'utf8');
  const block = [...markdown.matchAll(/^```tsx check\r?\n([\s\S]*?)^```/gm)]
    .map((match) => match[1])
    .find((code) => code.includes(`function ${name}`));
  if (!block) throw new Error(`${doc} has no checked example defining ${name}`);
  return block;
}

async function main() {
  assertFreshBuild();

  const scratch = resolve(e2eConsumerDir());
  assertDisposable(scratch, process.env.EPR_E2E_DIR !== undefined);
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  writeFileSync(join(scratch, MARKER), '');
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

  // Saved dependencies: `shadcn add` runs its own npm install, which would
  // prune anything installed with --no-save.
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
      '--ignore-scripts',
      join(scratch, pack.filename),
      'react@19',
      'react-dom@19',
      'tailwindcss@4',
      '@tailwindcss/vite@4',
    ],
    { cwd: scratch, stdio: 'inherit' },
  );

  const appDir = join(scratch, 'app');
  const outDir = join(scratch, 'dist');
  cpSync(join(__dirname, 'app'), appDir, { recursive: true });
  // The emoji-mart guide's adapter runs as documented: its checked example
  // is extracted from the Markdown, not copied by hand.
  cpSync(join(__dirname, 'guide'), join(appDir, 'guide'), { recursive: true });
  writeFileSync(
    join(appDir, 'guide', 'adapter.tsx'),
    guideExample(
      'docs/v5/MIGRATING_FROM_EMOJI_MART.md',
      'toEmojiMartSelection',
    ),
  );

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
      build: {
        outDir,
        emptyOutDir: true,
        rolldownOptions: {
          input: [
            join(appDir, 'index.html'),
            join(appDir, 'guide', 'index.html'),
          ],
        },
      },
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

  const shadcnOut = join(outDir, 'shadcn');
  await buildShadcnConsumer({
    scratch,
    tarball: join(scratch, pack.filename),
    outDir: shadcnOut,
  });

  const manifest = JSON.stringify({
    version: pack.version,
    tarball: pack.filename,
    packedBytes: pack.size,
    unpackedBytes: pack.unpackedSize,
    files: pack.entryCount,
  });
  for (const dir of [outDir, join(outDir, 'guide'), shadcnOut]) {
    writeFileSync(join(dir, 'e2e-manifest.json'), manifest);
  }
  console.log(
    `e2e consumer built from ${pack.filename} ` +
      `(${pack.size} B packed, ${pack.unpackedSize} B unpacked, ${pack.entryCount} files)`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
