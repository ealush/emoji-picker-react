import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { request } from 'node:http';
import { join } from 'node:path';

const root = join(__dirname, '..');
async function unusedPort(): Promise<number> {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert(address && typeof address === 'object');
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}
function status(port: number, host: string, path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = request(
      { hostname: '127.0.0.1', port, path, headers: { Host: host } },
      (response) => {
        response.resume();
        resolve(response.statusCode ?? 0);
      },
    );
    req.setTimeout(3000, () => req.destroy(new Error('HTTP timeout')));
    req.on('error', reject);
    req.end();
  });
}
async function check(binding: string, configured: boolean): Promise<void> {
  const port = await unusedPort();
  const extraHost = 'storybook-test.invalid';
  const child = spawn(
    join(root, 'node_modules/.bin/storybook'),
    ['dev', '--ci', '--host', binding, '--port', String(port)],
    {
      cwd: root,
      env: {
        ...process.env,
        STORYBOOK_ALLOWED_HOSTS: configured
          ? ` ${extraHost}, ${extraHost} `
          : '',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let log = '';
  const append = (data: Buffer) => {
    log = (log + data.toString()).slice(-12000);
  };
  child.stdout.on('data', append);
  child.stderr.on('data', append);
  let spawnError: Error | undefined;
  child.on('error', (error) => {
    spawnError = error;
  });
  try {
    const deadline = Date.now() + 120000;
    while (true) {
      if (spawnError) throw spawnError;
      if (child.exitCode !== null || child.signalCode !== null)
        throw new Error(`Storybook exited: ${log}`);
      try {
        if ((await status(port, 'localhost', '/index.json')) === 200) break;
      } catch {
        /* Wait for the server. */
      }
      if (Date.now() > deadline)
        throw new Error(`Storybook startup timed out: ${log}`);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    for (const path of ['/', '/iframe.html']) {
      assert.equal(await status(port, 'localhost', path), 200);
      assert.equal(
        await status(port, extraHost, path),
        configured || binding === '0.0.0.0' ? 200 : 403,
      );
      assert.equal(
        await status(port, 'unconfigured.invalid', path),
        !configured && binding === '0.0.0.0' ? 200 : 403,
      );
    }
    console.log(
      `Storybook hosts: ${binding}, environment ${configured ? 'configured' : 'empty'} passed`,
    );
  } finally {
    if (child.exitCode === null && child.signalCode === null && !spawnError) {
      const closed = once(child, 'close');
      child.kill('SIGTERM');
      const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
      await closed;
      clearTimeout(timer);
    }
  }
}
async function main(): Promise<void> {
  for (const binding of ['127.0.0.1', '0.0.0.0']) {
    for (const configured of [false, true]) await check(binding, configured);
  }
}
main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
