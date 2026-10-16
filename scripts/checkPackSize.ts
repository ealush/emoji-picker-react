import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

// Published package budget: what `npm install emoji-picker-react` downloads
// and writes to disk, measured from the real `npm pack` file list.
//
// Each locale dataset ships once as JSON and once as an ES module; the
// CommonJS twin requires the JSON (scripts/buildDataTwins.ts). The raw
// `src/data/*.json` copies remain for resolvers that ignore the exports map
// (v4 deep imports). Like size-limit, these budgets are not raised to make a
// change fit: a change that needs more space removes a duplicate elsewhere.
//
// Run: npm run check:pack-size (after npm run build)

const BUDGET = {
  unpackedBytes: 25_000_000,
  packedBytes: 5_050_000,
  files: 340,
};

type PackFile = { path: string; size: number };
type Pack = {
  size: number;
  unpackedSize: number;
  entryCount: number;
  files: PackFile[];
};

function isPack(value: unknown): value is Pack {
  if (typeof value !== 'object' || value === null) return false;
  const pack = value as Record<string, unknown>;
  return (
    typeof pack.size === 'number' &&
    typeof pack.unpackedSize === 'number' &&
    typeof pack.entryCount === 'number' &&
    Array.isArray(pack.files)
  );
}

const repoRoot = join(__dirname, '..');
const result = spawnSync(
  'npm',
  ['pack', '--dry-run', '--json', '--ignore-scripts'],
  { cwd: repoRoot, encoding: 'utf8' },
);
if (result.status !== 0) throw new Error(result.stderr || 'npm pack failed');
const output: unknown = JSON.parse(result.stdout);
const pack = Array.isArray(output) ? output[0] : undefined;
if (!isPack(pack)) throw new Error('unexpected `npm pack --json` output');

const failures: string[] = [];
const mb = (bytes: number) => `${(bytes / 1e6).toFixed(2)} MB`;

if (pack.unpackedSize > BUDGET.unpackedBytes) {
  failures.push(
    `unpacked ${mb(pack.unpackedSize)} exceeds ${mb(BUDGET.unpackedBytes)}`,
  );
}
if (pack.size > BUDGET.packedBytes) {
  failures.push(`packed ${mb(pack.size)} exceeds ${mb(BUDGET.packedBytes)}`);
}
if (pack.entryCount > BUDGET.files) {
  failures.push(`${pack.entryCount} files exceed ${BUDGET.files}`);
}

// Raw TypeScript beside declarations wins resolution in consumers and
// re-type-checks datasets; only compiled output and declarations ship.
const sources = pack.files
  .map((file) => file.path)
  .filter((path) => /\.(tsx?|mts|cts)$/.test(path) && !/\.d\.m?ts$/.test(path));
if (sources.length > 0) {
  failures.push(`raw TypeScript sources shipped: ${sources.join(', ')}`);
}
const strays = pack.files
  .map((file) => file.path)
  .filter(
    (path) => path.startsWith('src/') && !/^src\/data\/[^/]+\.json$/.test(path),
  );
if (strays.length > 0) {
  failures.push(`src/ files other than src/data/*.json: ${strays.join(', ')}`);
}

console.log(
  `package: ${mb(pack.size)} packed (budget ${mb(BUDGET.packedBytes)}), ` +
    `${mb(pack.unpackedSize)} unpacked (budget ${mb(BUDGET.unpackedBytes)}), ` +
    `${pack.entryCount} files (budget ${BUDGET.files})`,
);
if (failures.length > 0) {
  console.error(failures.map((failure) => `  ✗ ${failure}`).join('\n'));
  process.exit(1);
}
