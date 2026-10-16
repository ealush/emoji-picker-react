// Serves the built e2e consumer under the policy a security-conscious host
// would set: same-origin scripts, styles by nonce or same-origin file only
// (no 'unsafe-inline'), and no third-party origin for anything. The picker
// must render, search and select with nothing loosened.
import { randomBytes } from 'node:crypto';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';

import { E2E_CONSUMER_PORT, e2eConsumerDir } from './paths';

const root = resolve(join(e2eConsumerDir(), 'dist'));
if (!existsSync(join(root, 'index.html'))) {
  throw new Error('Run scripts/e2e-consumer/prepare.ts before serving');
}

const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function policy(nonce: string): string {
  return [
    "default-src 'none'",
    "script-src 'self'",
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url ?? '/', 'http://localhost').pathname,
    );
    const file = resolve(
      root,
      `.${pathname}`,
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
    const nonce = randomBytes(16).toString('base64');
    const headers = {
      'Content-Type': types[extname(file)] ?? 'application/octet-stream',
      'Content-Security-Policy': policy(nonce),
      'Cache-Control': 'no-store',
    };
    if (extname(file) === '.html') {
      res.writeHead(200, headers);
      res.end(readFileSync(file, 'utf8').replace('__CSP_NONCE__', nonce));
      return;
    }
    res.writeHead(200, headers);
    if (req.method === 'HEAD') res.end();
    else createReadStream(file).pipe(res);
  } catch {
    res.writeHead(400).end();
  }
}).listen(E2E_CONSUMER_PORT, '127.0.0.1', () =>
  console.log(`e2e consumer: http://127.0.0.1:${E2E_CONSUMER_PORT}/`),
);
