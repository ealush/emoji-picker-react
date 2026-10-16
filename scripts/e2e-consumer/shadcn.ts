// shadcn/ui consumer: runs the README's install command with the real
// shadcn CLI against the registry this checkout generates
// (website/public/r, served locally), then builds the result with Tailwind
// v4 and an app theme. The registry item's npm dependency is replaced by the
// packed tarball afterwards, so the page runs this checkout's library.
import { execFile, execFileSync } from 'node:child_process';
import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join, resolve, sep } from 'node:path';
import { promisify } from 'node:util';

const repoRoot = join(__dirname, '..', '..');
const template = join(__dirname, 'shadcn');
const registryDir = resolve(repoRoot, 'website', 'public');

/** Serves website/public on an ephemeral loopback port until closed. */
function serveRegistry(): Promise<{ origin: string; close: () => void }> {
  const server = createServer((req, res) => {
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
    const file = resolve(registryDir, `.${pathname}`);
    if (!file.startsWith(`${registryDir}${sep}`) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    createReadStream(file).pipe(res);
  });
  return new Promise((done) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo;
      done({ origin: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

export async function buildShadcnConsumer({
  scratch,
  tarball,
  outDir,
}: {
  scratch: string;
  tarball: string;
  outDir: string;
}): Promise<void> {
  for (const file of ['components.json', 'tsconfig.json']) {
    copyFileSync(join(template, file), join(scratch, file));
  }
  mkdirSync(join(scratch, 'src'), { recursive: true });
  copyFileSync(join(template, 'index.css'), join(scratch, 'src', 'index.css'));
  mkdirSync(join(scratch, 'shadcn'), { recursive: true });
  for (const file of ['index.html', 'main.tsx']) {
    copyFileSync(join(template, file), join(scratch, 'shadcn', file));
  }

  const registry = await serveRegistry();
  try {
    const cli = process.env.EPR_E2E_SHADCN ?? 'shadcn@latest';
    const { stdout } = await promisify(execFile)(
      'npx',
      [
        '--yes',
        cli,
        'add',
        `${registry.origin}/r/emoji-picker.json`,
        '--yes',
        '--cwd',
        scratch,
      ],
      { cwd: scratch, env: { ...process.env, CI: '1' } },
    );
    process.stdout.write(stdout);
  } finally {
    registry.close();
  }

  const installed = join(
    scratch,
    'src',
    'components',
    'ui',
    'emoji-picker.tsx',
  );
  if (
    readFileSync(installed, 'utf8') !==
    readFileSync(join(repoRoot, 'registry', 'emoji-picker.tsx'), 'utf8')
  ) {
    throw new Error(
      `shadcn add wrote ${installed}, which differs from registry/emoji-picker.tsx`,
    );
  }
  // `shadcn add` installed the registry dependency from npm; run this
  // checkout's build instead.
  execFileSync(
    'npm',
    ['install', '--no-audit', '--no-fund', '--ignore-scripts', tarball],
    { cwd: scratch, stdio: 'inherit' },
  );

  const viteConfig = join(scratch, 'vite.shadcn.config.mjs');
  writeFileSync(
    viteConfig,
    [
      "import tailwindcss from '@tailwindcss/vite';",
      `export default ${JSON.stringify({
        root: join(scratch, 'shadcn'),
        logLevel: 'warn',
        base: './',
        resolve: { alias: { '@': join(scratch, 'src') } },
        oxc: { jsx: { runtime: 'automatic' } },
        build: { outDir, emptyOutDir: true },
      }).replace(/^\{/, '{ plugins: [tailwindcss()],')};`,
      '',
    ].join('\n'),
  );
  execFileSync(
    join(repoRoot, 'node_modules', '.bin', 'vite'),
    ['build', '--config', viteConfig],
    { cwd: scratch, stdio: 'inherit' },
  );
}
