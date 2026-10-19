// Reproducible size comparison behind docs/v5/MIGRATING_FROM_EMOJI_MART.md.
//
// Installs this checkout's packed tarball next to emoji-mart and frimousse
// in a scratch directory, bundles the smallest working picker for each with
// esbuild (React external, minified, ESM with code splitting) and measures:
// - initial JS: the entry chunk plus its static imports, gzipped;
// - deferred JS: dynamically imported chunks (loaded after first render);
// - runtime fetch: data the default configuration downloads from a CDN at
//   runtime (measured from the same files on npm), gzipped;
// - install: bytes written to node_modules by the library and its own
//   dependencies (React excluded).
//
// Run: npm run compare:sizes (after npm run build). Requires network
// access for the scratch install. Prints a Markdown table.
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

import { buildSync, type Metafile } from 'esbuild';

const repoRoot = join(__dirname, '..');

type Case = {
  name: string;
  source: string;
  /** node_modules packages the case installs (for the install column). */
  packages: string[];
  /** Files the default configuration fetches at runtime, relative to node_modules. */
  fetched?: string[];
  note: string;
};

const CASES: Case[] = [
  {
    name: 'emoji-picker-react `<EmojiPicker />`',
    source: `import EmojiPicker from 'emoji-picker-react';
export default () => <EmojiPicker />;`,
    packages: ['emoji-picker-react', 'shipstyles'],
    note: 'English data bundled; 27 more locales installed',
  },
  {
    name: 'emoji-picker-react primitives',
    source: `import { Root, Panel, Search, CategoryNav, Viewport, List } from 'emoji-picker-react/primitives';
export default () => (
  <Root appearance="default">
    <Panel><Search /><CategoryNav /><Viewport><List /></Viewport></Panel>
  </Root>
);`,
    packages: ['emoji-picker-react', 'shipstyles'],
    note: 'Data loads from your bundle after first render',
  },
  {
    name: 'emoji-mart, offline (`data` prop)',
    source: `import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
export default () => <Picker data={data} />;`,
    packages: ['emoji-mart', '@emoji-mart/react', '@emoji-mart/data'],
    note: 'Data bundled',
  },
  {
    name: 'emoji-mart, default',
    source: `import Picker from '@emoji-mart/react';
export default () => <Picker />;`,
    packages: ['emoji-mart', '@emoji-mart/react'],
    fetched: ['@emoji-mart/data/sets/15/native.json'],
    note: 'Fetches data from jsDelivr (`@latest`)',
  },
  {
    name: 'frimousse',
    source: `import { EmojiPicker } from 'frimousse';
export default () => (
  <EmojiPicker.Root>
    <EmojiPicker.Search />
    <EmojiPicker.Viewport>
      <EmojiPicker.Loading>Loading…</EmojiPicker.Loading>
      <EmojiPicker.Empty>No emoji found.</EmojiPicker.Empty>
      <EmojiPicker.List />
    </EmojiPicker.Viewport>
  </EmojiPicker.Root>
);`,
    packages: ['frimousse'],
    fetched: ['emojibase-data/en/data.json', 'emojibase-data/en/messages.json'],
    note: 'Fetches data from jsDelivr unless `emojibaseUrl` is self-hosted; you style every part',
  },
];

function run(command: string, args: string[], cwd: string): string {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
}

function version(scratch: string, name: string): string {
  const manifest: unknown = JSON.parse(
    readFileSync(join(scratch, 'node_modules', name, 'package.json'), 'utf8'),
  );
  const value = (manifest as { version?: unknown }).version;
  if (typeof value !== 'string') throw new Error(`no version for ${name}`);
  return value;
}

function directoryBytes(path: string): number {
  const stats = statSync(path);
  if (!stats.isDirectory()) return stats.size;
  return readdirSync(path).reduce(
    (total, entry) => total + directoryBytes(join(path, entry)),
    0,
  );
}

function gzipped(path: string): number {
  return gzipSync(readFileSync(path), { level: 9 }).length;
}

/** Entry chunk plus everything it imports statically; the rest is deferred. */
function measure(metafile: Metafile, workingDir: string) {
  const outputs = metafile.outputs;
  const entry = Object.keys(outputs).find(
    (file) => outputs[file].entryPoint && file.endsWith('.js'),
  );
  if (!entry) throw new Error('esbuild produced no entry chunk');
  const initial = new Set<string>();
  const visit = (file: string) => {
    if (initial.has(file)) return;
    initial.add(file);
    for (const imported of outputs[file].imports) {
      if (imported.kind === 'import-statement' && !imported.external) {
        visit(imported.path);
      }
    }
  };
  visit(entry);
  let initialBytes = 0;
  let deferredBytes = 0;
  for (const file of Object.keys(outputs).filter((name) =>
    name.endsWith('.js'),
  )) {
    const bytes = gzipped(join(workingDir, file));
    if (initial.has(file)) initialBytes += bytes;
    else deferredBytes += bytes;
  }
  return { initialBytes, deferredBytes };
}

function kb(bytes: number): string {
  return bytes === 0 ? '—' : `${(bytes / 1024).toFixed(1)} KB`;
}

function mb(bytes: number): string {
  return `${(bytes / 1e6).toFixed(1)} MB`;
}

function main() {
  const scratch = mkdtempSync(join(tmpdir(), 'epr-compare-'));
  console.error(`size comparison scratch dir: ${scratch}`);
  const packed: unknown = JSON.parse(
    run(
      'npm',
      ['pack', '--json', '--pack-destination', scratch, '--ignore-scripts'],
      repoRoot,
    ),
  );
  const tarball = Array.isArray(packed)
    ? (packed[0] as { filename?: unknown }).filename
    : undefined;
  if (typeof tarball !== 'string') throw new Error('npm pack failed');

  writeFileSync(join(scratch, 'package.json'), '{"private":true}');
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      // @emoji-mart/react declares react ^16.8 || ^17 || ^18; React 19 apps
      // install it this way.
      '--legacy-peer-deps',
      '--no-audit',
      '--no-fund',
      join(scratch, tarball),
      'emoji-mart@5',
      '@emoji-mart/react@1',
      '@emoji-mart/data@1',
      'frimousse@latest',
      // Only to measure what frimousse fetches at runtime.
      'emojibase-data@latest',
      'react@19',
      'react-dom@19',
    ],
    scratch,
  );

  const rows: string[] = [];
  CASES.forEach((entry, index) => {
    const source = join(scratch, `case-${index}.jsx`);
    const outdir = join(scratch, `out-${index}`);
    writeFileSync(source, entry.source);
    const result = buildSync({
      entryPoints: [source],
      outdir,
      bundle: true,
      splitting: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
      minify: true,
      jsx: 'automatic',
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      define: { 'process.env.NODE_ENV': '"production"' },
      loader: { '.json': 'json' },
      metafile: true,
      absWorkingDir: scratch,
      logLevel: 'error',
    });
    const { initialBytes, deferredBytes } = measure(result.metafile, scratch);
    const fetched = (entry.fetched ?? []).reduce(
      (total, file) => total + gzipped(join(scratch, 'node_modules', file)),
      0,
    );
    const install = entry.packages.reduce(
      (total, name) =>
        total + directoryBytes(join(scratch, 'node_modules', name)),
      0,
    );
    const versions = entry.packages
      .filter((name) => name !== 'shipstyles')
      .map((name) => `${name}@${version(scratch, name)}`)
      .join(', ');
    rows.push(
      `| ${entry.name} | ${kb(initialBytes)} | ${kb(deferredBytes)} | ${kb(
        fetched,
      )} | ${mb(install)} | ${entry.note} | ${versions} |`,
    );
  });

  console.log(
    [
      `Measured ${new Date().toISOString().slice(0, 10)} with \`npm run compare:sizes\` (esbuild ${version(repoRoot, 'esbuild')}, minified, gzip -9, React external).`,
      '',
      '| Picker | Initial JS (gz) | Deferred JS (gz) | Fetched at runtime (gz) | Install size | Notes | Versions |',
      '| --- | --- | --- | --- | --- | --- | --- |',
      ...rows,
    ].join('\n'),
  );
}

main();
