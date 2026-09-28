// Packed ESM consumer (runs inside the scratch install of the tarball).
import assert from 'node:assert';
import { createRequire } from 'node:module';

const requireFromScratch = createRequire(import.meta.url);

const primitives = await import('emoji-picker-react/primitives');
for (const key of ['Root', 'Search', 'CategoryNav', 'Viewport', 'List', 'Preview']) {
  assert.ok(
    primitives[key] && ['function', 'object'].includes(typeof primitives[key]),
    `missing primitive export: ${key}`,
  );
}
console.log('ok: primitives ESM named exports resolve');

const data = await import('emoji-picker-react/data');
assert.strictEqual(typeof data.getEmojiByUnified, 'function');
assert.strictEqual(typeof data.searchEmojis, 'function');
assert.strictEqual(data.getEmojiByUnified('1f600')?.unified, '1f600');
console.log('ok: data ESM named exports resolve');

const main = await import('emoji-picker-react');
assert.ok(main.default, 'main ESM default export missing');
console.log('ok: main ESM default export resolves');

// Locale ESM interop (CJS-authored locale file behind the export map).
const locale = await import('emoji-picker-react/data/emojis-es');
const dataset = locale.default ?? locale;
assert.ok(dataset.categories && dataset.emojis, 'locale dataset shape');
console.log('ok: locale ESM interop resolves');

console.log('packed ESM consumer: all checks passed');
