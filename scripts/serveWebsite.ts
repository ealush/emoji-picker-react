// Serve only the production export, including its real GitHub Pages subpath.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

const root = resolve(__dirname, '../website/out');
const base = '/emoji-picker-react';
const port = Number(process.env.WEBSITE_PORT ?? 6020);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error('WEBSITE_PORT must be a valid port');
if (!existsSync(join(root, 'index.html')))
  throw new Error('Build the website before serving its export');
const types: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};
createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url ?? '/', 'http://localhost').pathname,
    );
    if (pathname === base) {
      res.writeHead(308, { Location: `${base}/` }).end();
      return;
    }
    if (!pathname.startsWith(`${base}/`)) {
      res.writeHead(404).end();
      return;
    }
    const file = resolve(
      root,
      `.${pathname.slice(base.length)}`,
      pathname.endsWith('/') ? 'index.html' : '',
    );
    if (
      !file.startsWith(`${root}${sep}`) ||
      !existsSync(file) ||
      !statSync(file).isFile()
    ) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
    });
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).pipe(res);
  } catch {
    res.writeHead(400).end();
  }
}).listen(port, '127.0.0.1', () =>
  console.log(`Website export: http://127.0.0.1:${port}${base}/`),
);
