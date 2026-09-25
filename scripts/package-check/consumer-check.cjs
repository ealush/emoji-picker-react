// Packed CJS consumer (runs inside the scratch install of the tarball).
const assert = require('assert');
const { readFileSync } = require('fs');
const { createRequire } = require('module');

const requireFromScratch = createRequire(__filename);
const pkgDir = requireFromScratch.resolve('emoji-picker-react/package.json').replace(/package\.json$/, '');
const read = (subpath) => readFileSync(pkgDir + subpath, 'utf8');

function check(name, fn) {
  fn();
  console.log(`ok: ${name}`);
}

// Main entry resolves with declarations.
check('main entry resolves', () => {
  const main = requireFromScratch('emoji-picker-react');
  assert.strictEqual(typeof main.default, 'function');
  assert.ok(requireFromScratch.resolve('emoji-picker-react'));
});

// Primitives resolve with declarations and the exact export set.
check('primitives entry resolves', () => {
  const primitives = requireFromScratch('emoji-picker-react/primitives');
  for (const key of ['Root', 'Search', 'CategoryNav', 'Viewport', 'List', 'Preview']) {
    // forwardRef components are objects; plain functions are functions.
    assert.ok(
      primitives[key] && ['function', 'object'].includes(typeof primitives[key]),
      `missing primitive export: ${key}`,
    );
  }
});

// No public Panel or Reactions primitive.
check('no Panel/Reactions primitive', () => {
  const primitives = requireFromScratch('emoji-picker-react/primitives');
  assert.strictEqual(primitives.Panel, undefined);
  assert.strictEqual(primitives.Reactions, undefined);
});

// Data entry resolves and searches the packaged dataset.
check('data entry resolves', () => {
  const data = requireFromScratch('emoji-picker-react/data');
  assert.strictEqual(typeof data.getEmojiByUnified, 'function');
  assert.strictEqual(typeof data.searchEmojis, 'function');
  assert.strictEqual(data.getEmojiByUnified('1F600')?.unified, '1f600');
  assert.ok(data.searchEmojis('smile').length > 0);
  assert.deepStrictEqual(data.searchEmojis('   '), []);
});

// Locale subpaths: canonical and deprecated v4 deep paths.
check('locale subpaths resolve', () => {
  const canonical = requireFromScratch('emoji-picker-react/data/emojis-es');
  const legacy = requireFromScratch('emoji-picker-react/dist/data/emojis-es');
  const dataset = canonical.default ?? canonical;
  assert.ok(dataset.categories && dataset.emojis, 'locale dataset shape');
  assert.ok((legacy.default ?? legacy).categories, 'legacy locale path shape');
});

// Importing one locale must not pull every locale.
check('locale isolation', () => {
  const es = read('dist/data/emojis-es.js');
  assert.ok(!es.includes('emojis-de') && !es.includes('emojis-fr'), 'es bundle references other locales');
});

// Locale datasets are pure data: no locale file may statically depend on
// another module at all (single-locale consumers stay lean).
check('locale files have no static dependencies', () => {
  const { readdirSync } = require('fs');
  const { join } = require('path');
  const dir = pkgDir + 'dist/data';
  const locales = readdirSync(dir).filter((entry) => /^emojis-.*\.js$/.test(entry));
  assert.ok(locales.length > 1, 'expected multiple locale files');
  for (const entry of locales) {
    const content = read(`dist/data/${entry}`);
    assert.ok(
      !/\brequire\s*\(|\bimport\s+[^'"]*?\sfrom\s+['"]/.test(content),
      `${entry} contains a static module dependency`,
    );
  }
});

// Data entry loads with framework resolution blocked.
check('data entry imports no framework', () => {
  const Module = require('module');
  const original = Module._resolveFilename;
  Module._resolveFilename = function (request, ...args) {
    if (['react', 'react-dom', 'shipstyles'].includes(request)) {
      throw new Error(`blocked framework import: ${request}`);
    }
    return original.call(this, request, ...args);
  };
  try {
    delete require.cache[requireFromScratch.resolve('emoji-picker-react/data')];
    const data = requireFromScratch('emoji-picker-react/data');
    assert.ok(data.searchEmojis('smile').length > 0);
  } finally {
    Module._resolveFilename = original;
  }
  for (const file of ['dist/data/index.js', 'dist/data/index.mjs']) {
    const content = read(file);
    assert.ok(!/from\s+['"]react['"]|require\(['"]react['"]\)/.test(content), `${file} imports react`);
    assert.ok(!/shipstyles/.test(content), `${file} imports shipstyles`);
  }
});

// Primitives must not drag in the default appearance wrapper.
check('primitives exclude default appearance', () => {
  for (const file of ['dist/primitives/index.js', 'dist/primitives/index.mjs']) {
    const content = read(file);
    for (const marker of ['ErrorBoundary', 'baseVariables', '--epr-dark-hover-bg-color']) {
      assert.ok(!content.includes(marker), `${file} contains ${marker}`);
    }
  }
  // Sanity: the markers exist in the main bundle, so the scan is meaningful.
  const main = read('dist/emoji-picker-react.esm.js');
  assert.ok(main.includes('ErrorBoundary'), 'main bundle sanity marker missing');
});

// Declarations ship for every entry.
check('declarations present', () => {
  for (const file of ['dist/index.d.ts', 'dist/primitives/index.d.ts', 'dist/data.d.ts']) {
    assert.ok(read(file).length > 0, `${file} empty`);
  }
  const primitiveTypes = read('dist/primitives/index.d.ts');
  assert.ok(primitiveTypes.includes('Root'), 'primitive types missing Root');
});

// Packed main renders to a string (react-dom/server smoke).
check('packed main server-renders', () => {
  const React = requireFromScratch('react');
  const ReactDOMServer = requireFromScratch('react-dom/server');
  const { default: EmojiPicker } = requireFromScratch('emoji-picker-react');
  const html = ReactDOMServer.renderToString(React.createElement(EmojiPicker));
  assert.ok(html.includes('aside') || html.includes('EmojiPickerReact'), 'SSR markup missing picker');
  assert.ok(!/\sid="/.test(html.replace(/<style[\s\S]*?<\/style>/g, '')), 'SSR markup contains library ids');
});

console.log('packed CJS consumer: all checks passed');
