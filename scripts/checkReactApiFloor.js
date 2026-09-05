// Guards the React peer floor (>=16.8).
// Fails if src uses any React API newer than hooks-era 16.8, so the
// declared peer range stays justified by actual internal API usage.
// Run: npm run check:react-floor
const { readFileSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

const root = join(__dirname, '..', 'src');

// [pattern, minimum React version that introduced it]
const denied = [
  [/\buseId\b/, '18.0'],
  [/\buseSyncExternalStore\b/, '18.0'],
  [/\buseInsertionEffect\b/, '18.0'],
  [/\buseTransition\b/, '18.0'],
  [/\buseDeferredValue\b/, '18.0'],
  [/\buseOptimistic\b/, '18.3 canary / 19.0'],
  [/\buseActionState\b/, '19.0'],
  [/from\s+['"]react-dom[^'"]*['"]/, 'banned: no react-dom in src'],
  [/react\/jsx-runtime|react\/jsx-dev-runtime/, '16.14/17.0 (banned: classic jsx)'],
  [/\bcreateRoot\b|\bhydrateRoot\b/, '18.0 (banned: no react-dom in src)'],
  [/\bflushSync\b/, '18.0 (banned: no react-dom in src)'],
];

function sourceFiles(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      return sourceFiles(full);
    }
    return /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}

let violations = [];
for (const file of sourceFiles(root)) {
  const content = readFileSync(file, 'utf8');
  for (const [pattern, since] of denied) {
    const match = content.match(pattern);
    if (match) {
      violations.push(
        `${file.replace(`${root}/`, '')}: ${match[0]} [${since}]`,
      );
    }
  }
}

if (violations.length > 0) {
  console.error(
    'React floor violations (peer requires >=16.8):\n' +
      violations.map((v) => `  - ${v}`).join('\n'),
  );
  process.exit(1);
}

console.log('React API floor check passed (src uses React <=16.8 APIs only).');
