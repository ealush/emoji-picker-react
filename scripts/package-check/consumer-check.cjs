// Packed CJS consumer (runs inside the scratch install of the tarball).
const assert = require('assert');
const { readFileSync } = require('fs');
const { createRequire } = require('module');

const requireFromScratch = createRequire(__filename);
const pkgDir = requireFromScratch.resolve('emoji-picker-react/package.json').replace(/package\.json$/, '');
const read = (subpath) => readFileSync(pkgDir + subpath, 'utf8');
const path = require('path');

// The ESM entries are code-split: an entry file re-exports from shared
// chunks. Scans therefore cover an entry's whole static import closure
// (what loads up front), not just the entry file.
function staticClosure(subpath) {
  const seen = new Set();
  const contents = [];
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const content = read(file);
    contents.push(content);
    const staticImport = /(?:^|[;\n}])\s*(?:import|export)\s*(?:[^'"()]*?\sfrom\s*)?["'](\.{1,2}\/[^"']+)["']/g;
    let match;
    while ((match = staticImport.exec(content))) {
      visit(path.posix.join(path.posix.dirname(file), match[1]));
    }
  };
  visit(subpath);
  return contents.join('\n');
}

const pending = [];

function check(name, fn) {
  pending.push({ name, fn });
}

async function runChecks() {
  // Sequential: checks share globals (window/document) and the packed
  // module registry, so they must not interleave.
  for (const { name, fn } of pending) {
    await fn();
    console.log(`ok: ${name}`);
  }
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
  for (const [file, content] of [
    ['dist/data/index.js', read('dist/data/index.js')],
    ['dist/esm/data.mjs', staticClosure('dist/esm/data.mjs')],
  ]) {
    assert.ok(!/from\s+['"]react['"]|require\(['"]react['"]\)/.test(content), `${file} imports react`);
    assert.ok(!/shipstyles/.test(content), `${file} imports shipstyles`);
  }
});

// Primitives must not drag in the default appearance wrapper.
check('primitives exclude default appearance', () => {
  for (const [file, content] of [
    ['dist/primitives/index.js', read('dist/primitives/index.js')],
    ['dist/esm/primitives/index.mjs', staticClosure('dist/esm/primitives/index.mjs')],
  ]) {
    for (const marker of ['ErrorBoundary', 'baseVariables', '--epr-dark-hover-bg-color']) {
      assert.ok(!content.includes(marker), `${file} contains ${marker}`);
    }
  }
  // Sanity: the markers exist in the main bundle, so the scan is meaningful.
  const main = staticClosure('dist/esm/index.mjs');
  assert.ok(main.includes('ErrorBoundary'), 'main bundle sanity marker missing');
});

// Lean primitives: the dataset is not loaded up front by the ESM
// primitives entry, but is reachable on demand; the main entry ships it.
check('primitives load the dataset on demand', () => {
  const DATASET_MARKER = 'grinning face with big eyes';
  const primitives = staticClosure('dist/esm/primitives/index.mjs');
  assert.ok(!primitives.includes(DATASET_MARKER), 'primitives ESM eagerly includes the dataset');
  assert.ok(/import\(\s*["']\.{1,2}\/[^"']+["']\s*\)/.test(primitives), 'primitives ESM has no lazy dataset import');
  assert.ok(staticClosure('dist/esm/index.mjs').includes(DATASET_MARKER), 'main ESM is missing the dataset');
});

// One implementation across ESM entries: main and primitives share chunks.
check('ESM entries share their implementation', () => {
  const chunksOf = (file) => new Set((read(file).match(/\.\/(?:\.\.\/)?chunks\/[^"']+/g) || []).map((c) => c.replace(/^.*chunks\//, '')));
  const main = chunksOf('dist/esm/index.mjs');
  const primitives = chunksOf('dist/esm/primitives/index.mjs');
  assert.ok([...primitives].some((chunk) => main.has(chunk)), 'main and primitives ESM share no chunk');
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

// Packed entries mount, interact, and unmount in a real DOM.
check('packed entries client-mount', async () => {
  const { JSDOM } = requireFromScratch('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  if (typeof global.IntersectionObserver === 'undefined') {
    global.IntersectionObserver = class {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        this.callback([{ isIntersecting: true, intersectionRatio: 1, target }], this);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
  }
  if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
    global.cancelAnimationFrame = (cb) => clearTimeout(cb);
  }

  const React = requireFromScratch('react');
  const ReactDOMClient = requireFromScratch('react-dom/client');
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { default: EmojiPicker } = requireFromScratch('emoji-picker-react');
  const primitives = requireFromScratch('emoji-picker-react/primitives');

  const clicked = [];
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);
  const { act } = requireFromScratch('react-dom/test-utils');
  await act(async () => {
    root.render(
      React.createElement(
        primitives.Root,
        { emojiData: undefined, onEmojiClick: (emoji) => clicked.push(emoji) },
        React.createElement(primitives.Search),
        React.createElement(
          primitives.Viewport,
          null,
          React.createElement(primitives.List),
        ),
        React.createElement(primitives.Preview),
      ),
    );
  });
  const input = container.querySelector('input');
  assert.ok(input, 'primitive Search input mounted');
  assert.ok(container.querySelector('[role="grid"]'), 'primitive grid mounted');

  const mainContainer = document.createElement('div');
  document.body.appendChild(mainContainer);
  const mainRoot = ReactDOMClient.createRoot(mainContainer);
  let selected = null;
  await act(async () => {
    mainRoot.render(
      React.createElement(EmojiPicker, {
        onEmojiClick: (emoji) => {
          selected = emoji;
        },
      }),
    );
  });
  const button = mainContainer.querySelector('[data-epr-part="emoji"]');
  assert.ok(button, 'default emoji button mounted');
  button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.ok(selected && selected.unified, 'packed onEmojiClick fired');

  await act(async () => {
    root.unmount();
    mainRoot.unmount();
  });
  // Globals intentionally stay installed: picker timers may still fire
  // after unmount, and deleting window/document first turns those into
  // uncaught ReferenceErrors after the checks pass.
});

runChecks().then(
  () => {
    console.log('packed CJS consumer: all checks passed');
  },
  (error) => {
    console.error(error);
    process.exit(1);
  },
);
