import { buildSync } from 'esbuild';

/** Emit JS next to scratch-installed peers, preserving native Node module resolution. */
export function compileFixture(
  source: string,
  outfile: string,
  format: 'cjs' | 'esm',
): void {
  buildSync({
    entryPoints: [source],
    outfile,
    bundle: true,
    packages: 'external',
    platform: 'node',
    target: 'node18',
    format,
    logLevel: 'warning',
  });
}
