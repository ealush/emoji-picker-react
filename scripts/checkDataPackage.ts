import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Exercise the published data entry, not source aliases or workspace dist files.
const repoRoot = join(__dirname, '..');
const scratchRoot = join(repoRoot, '.codex-tmp');
mkdirSync(scratchRoot, { recursive: true });
const scratch = mkdtempSync(join(scratchRoot, 'data-package-'));

function run(command: string, args: string[], cwd = scratch): string {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  return result.stdout;
}

try {
  const output: unknown = JSON.parse(run('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', scratch], repoRoot));
  if (!Array.isArray(output) || typeof output[0]?.filename !== 'string') {
    throw new Error('npm pack returned no package filename');
  }
  writeFileSync(join(scratch, 'package.json'), '{"private":true}');
  run('npm', ['install', '--ignore-scripts', '--omit=peer', '--no-audit', '--no-fund', join(scratch, output[0].filename)]);
  const assertions = `
    const assert = require('node:assert/strict');
    assert.deepEqual(Object.keys(api).sort(), ['getEmojiByUnified', 'searchEmojis']);
    assert.equal(api.getEmojiByUnified(' 1F600 ')?.unified, '1f600');
    assert.equal(api.getEmojiByUnified('1f44d-1f3fb'), api.getEmojiByUnified('1f44d'));
    const results = api.searchEmojis(' SMILE ');
    assert.ok(results.length > 0 && Object.isFrozen(results));
    assert.ok(Object.isFrozen(results[0]) && Object.isFrozen(results[0].names));
    assert.notEqual(results, api.searchEmojis('smile'));
    assert.ok(api.searchEmojis('sonrisa', { emojiData: locale.default ?? locale }).length > 0);
    assert.ok(!Object.keys(require.cache).some(path => /node_modules[\\\\/](react|shipstyles)[\\\\/]/.test(path)));
  `;
  writeFileSync(join(scratch, 'consumer.cjs'), `const api = require('emoji-picker-react/data');\nconst locale = require('emoji-picker-react/data/emojis-es');\n${assertions}`);
  writeFileSync(join(scratch, 'consumer.mjs'), `import * as api from 'emoji-picker-react/data';\nimport * as locale from 'emoji-picker-react/data/emojis-es';\nimport { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);\n${assertions}`);
  run(process.execPath, ['consumer.cjs']);
  run(process.execPath, ['consumer.mjs']);

  // Type consumers resolve the packed declarations under native Node modes.
  // React types are needed by EmojiData's category icon type; no React runtime.
  mkdirSync(join(scratch, 'node_modules', '@types'), { recursive: true });
  symlinkSync(join(repoRoot, 'node_modules', '@types', 'react'), join(scratch, 'node_modules', '@types', 'react'), 'dir');
  const consumer = `import { searchEmojis, getEmojiByUnified, type EmojiInfo, type EmojiData } from 'emoji-picker-react/data';\nimport locale from 'emoji-picker-react/data/emojis-es';\nconst data: EmojiData = locale;\nconst matches: readonly EmojiInfo[] = searchEmojis('sonrisa', { emojiData: data });\nconst emoji: EmojiInfo | undefined = getEmojiByUnified('1F600');\n// @ts-expect-error lookup codes must be strings\ngetEmojiByUnified(123);\n// @ts-expect-error search results are readonly\nmatches.push({});\nif (emoji) {\n  // @ts-expect-error returned names are readonly\n  emoji.names.push('changed');\n}\nvoid matches; void emoji;\n`;
  writeFileSync(join(scratch, 'consumer.cts'), consumer);
  writeFileSync(join(scratch, 'consumer.mts'), consumer);
  writeFileSync(join(scratch, 'tsconfig.json'), JSON.stringify({ compilerOptions: { target: 'ES2019', module: 'NodeNext', moduleResolution: 'NodeNext', strict: true, noEmit: true, skipLibCheck: false, types: [] }, files: ['consumer.cts', 'consumer.mts'] }));
  run(process.execPath, [join(repoRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '--project', 'tsconfig.json']);
  console.log('Packed data entry: CommonJS, ESM, locales, declarations and React-free execution passed.');
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
