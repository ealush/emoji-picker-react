// Library build (replaces tsdx).
//
// Outputs:
// - dist/esm/**.mjs      ESM, one code-split build for every public entry:
//                        entries share chunks (one implementation, one set
//                        of module-level state), and the default dataset
//                        is its own chunk that the primitives entry loads
//                        on demand.
// - dist/index.js        CJS main entry.
// - dist/primitives/index.js, dist/data/index.js
//                        CJS subpath entries (CJS cannot share chunks).
// - dist/**.d.ts/.d.mts  declarations, bundled per entry (extensionless
//                        relative imports fail under node16-ESM resolution)
//                        with ESM-typed .d.mts twins for the import
//                        condition.
//
// Locale datasets (dist/data/emojis-*) come from build:data:dist, which
// runs before this script.
const { spawnSync } = require('child_process');
const {
  copyFileSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} = require('fs');
const { join } = require('path');

const { bundleDeclarations } = require('./bundleDeclarations');

const repoRoot = join(__dirname, '..');
const bin = (name) => join(repoRoot, 'node_modules', '.bin', name);

function sh(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: repoRoot });
  if (result.status !== 0) {
    throw new Error(`command failed: ${command} ${args.join(' ')}`);
  }
}

const EXTERNALS = [
  '--external:react',
  '--external:react-dom',
  '--external:shipstyles',
];

const COMMON = [...EXTERNALS, '--bundle', '--log-level=warning'];

function buildCjs(src, outfile) {
  sh(bin('esbuild'), [
    join(repoRoot, src),
    ...COMMON,
    '--format=cjs',
    '--platform=node',
    '--target=node14',
    `--outfile=${join(repoRoot, outfile)}`,
  ]);
}

function buildEsm() {
  rmSync(join(repoRoot, 'dist', 'esm'), { recursive: true, force: true });
  sh(bin('esbuild'), [
    join(repoRoot, 'src/index.tsx'),
    join(repoRoot, 'src/primitives/index.ts'),
    join(repoRoot, 'src/data.ts'),
    ...COMMON,
    '--splitting',
    '--format=esm',
    '--platform=neutral',
    '--target=es2019',
    `--outbase=${join(repoRoot, 'src')}`,
    `--outdir=${join(repoRoot, 'dist', 'esm')}`,
    '--entry-names=[dir]/[name]',
    '--chunk-names=chunks/[name]-[hash]',
    '--out-extension:.js=.mjs',
  ]);
}

async function buildDeclarations() {
  sh(bin('tsc'), ['--project', join(repoRoot, 'scripts', 'tsconfig.types.json')]);
  const entries = [
    ['index.d.ts', 'index.d.mts'],
    [join('primitives', 'index.d.ts'), join('primitives', 'index.d.mts')],
    ['data.d.ts', 'data.d.mts'],
  ];
  for (const [dts, dmts] of entries) {
    const path = join(repoRoot, 'dist', dts);
    if (!existsSync(path)) {
      throw new Error(`declarations missing: dist/${dts}`);
    }
    await bundleDeclarations(path);
    copyFileSync(path, join(repoRoot, 'dist', dmts));
  }
}

// React Server Components: the picker and primitives are client
// components, so their entry files carry "use client" (letting a Server
// Component render <EmojiPicker /> directly). Only entry files are marked:
// `emoji-picker-react/data` and shared chunks stay server-usable, e.g.
// searchEmojis() inside a Server Component or route handler.
function markClientEntries() {
  for (const file of [
    'dist/index.js',
    'dist/esm/index.mjs',
    'dist/primitives/index.js',
    'dist/esm/primitives/index.mjs',
  ]) {
    const path = join(repoRoot, file);
    const content = readFileSync(path, 'utf8');
    if (!/^\s*['"]use client['"]/.test(content)) {
      writeFileSync(path, `"use client";\n${content}`);
    }
  }
}

async function main() {
  if (!existsSync(bin('esbuild'))) {
    throw new Error('esbuild not found; run npm install first.');
  }
  buildEsm();
  buildCjs('src/index.tsx', 'dist/index.js');
  buildCjs('src/primitives/index.ts', 'dist/primitives/index.js');
  buildCjs('src/data.ts', 'dist/data/index.js');
  markClientEntries();
  await buildDeclarations();
  console.log('build complete: dist/esm (split ESM), CJS entries, declarations');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
