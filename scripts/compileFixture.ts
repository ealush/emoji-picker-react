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
    // Repository path aliases must never substitute source for the packed dependency.
    tsconfigRaw: { compilerOptions: {} },
    platform: 'node',
    target: 'node18',
    format,
    logLevel: 'warning',
  });
}
