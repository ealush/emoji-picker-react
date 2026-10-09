import type { EmojiClickData, EmojiData } from '../../src/types/exposedTypes';
import { installGlobals, FixtureIntersectionObserver } from '../fixtureDom.js';
import process from 'node:process';
import { readdirSync } from 'node:fs';
// Packed CJS consumer (runs inside the scratch install of the tarball).
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const requireFromScratch = createRequire(__filename);
const pkgDir = requireFromScratch
  .resolve('emoji-picker-react/package.json')
  .replace(/package\.json$/, '');
const read = (subpath: string) => readFileSync(pkgDir + subpath, 'utf8');
import path from 'node:path';

// The ESM entries are code-split: an entry file re-exports from shared
// chunks. Scans therefore cover an entry's whole static import closure
// (what loads up front), not just the entry file.
function staticClosure(subpath: string) {
  const seen = new Set();
  const contents: string[] = [];
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    const content = read(file);
    contents.push(content);
    const staticImport =
      /(?:^|[;\n}])\s*(?:import|export)\s*(?:[^'"()]*?\sfrom\s*)?["'](\.{1,2}\/[^"']+)["']/g;
    let match;
    while ((match = staticImport.exec(content))) {
      visit(path.posix.join(path.posix.dirname(file), match[1]));
    }
  };
  visit(subpath);
  return contents.join('\n');
}

const pending: Array<{ name: string; fn: () => void | Promise<void> }> = [];

function check(name: string, fn: () => void | Promise<void>) {
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
  const main = requireFromScratch(
    'emoji-picker-react',
  ) as typeof import('../../src/index');
  assert.strictEqual(typeof main.default, 'function');
  assert.ok(requireFromScratch.resolve('emoji-picker-react'));
});

// Primitives resolve with declarations and the exact export set.
check('primitives entry resolves', () => {
  const primitives = requireFromScratch(
    'emoji-picker-react/primitives',
  ) as typeof import('../../src/primitives/index');
  for (const key of [
    'Root',
    'Search',
    'SearchInput',
    'LoadError',
    'CategoryNav',
    'Viewport',
    'List',
    'Preview',
  ] as const) {
    // forwardRef components are objects; plain functions are functions.
    assert.ok(
      primitives[key] &&
        ['function', 'object'].includes(typeof primitives[key]),
      `missing primitive export: ${key}`,
    );
  }
});

// Explicit composition exports the same managed presence and reactions parts.
check('Panel/Reactions and custom actions resolve', () => {
  const primitives = requireFromScratch(
    'emoji-picker-react/primitives',
  ) as typeof import('../../src/primitives/index');
  assert.ok(primitives.Panel);
  assert.ok(primitives.Reactions);
  for (const hook of [
    'useSearchActions',
    'useCategoryNavigation',
    'usePickerMode',
  ] as const)
    assert.equal(typeof primitives[hook], 'function');
});

// Data entry resolves and searches the packaged dataset.
check('data entry resolves', () => {
  const data = requireFromScratch(
    'emoji-picker-react/data',
  ) as typeof import('../../src/data');
  assert.strictEqual(typeof data.getEmojiByUnified, 'function');
  assert.strictEqual(typeof data.searchEmojis, 'function');
  assert.strictEqual(data.getEmojiByUnified('1F600')?.unified, '1f600');
  assert.ok(data.searchEmojis('smile').length > 0);
  assert.deepStrictEqual(data.searchEmojis('   '), []);
});

// Locale subpaths: canonical and deprecated v4 deep paths.
check('locale subpaths resolve', () => {
  const canonical = requireFromScratch(
    'emoji-picker-react/data/emojis-es',
  ) as EmojiData & { default?: EmojiData };
  const legacy = requireFromScratch(
    'emoji-picker-react/dist/data/emojis-es',
  ) as EmojiData & { default?: EmojiData };
  // v4 docs and the project's own website imported the JSON datasets.
  const legacyJson = requireFromScratch(
    'emoji-picker-react/dist/data/emojis-es.json',
  ) as EmojiData;
  assert.ok(
    legacyJson.categories && legacyJson.emojis,
    'legacy .json locale path',
  );
  const dataset = canonical.default ?? canonical;
  assert.ok(dataset.categories && dataset.emojis, 'locale dataset shape');
  assert.ok((legacy.default ?? legacy).categories, 'legacy locale path shape');
});

// Real consumers read the raw dataset from the v4 source tree (wire-webapp:
// `emoji-picker-react/src/data/emojis.json`); the exports map keeps it.
check('v4 src dataset path resolves', () => {
  const raw = requireFromScratch(
    'emoji-picker-react/src/data/emojis.json',
  ) as EmojiData;
  assert.ok(raw.categories && raw.emojis, 'src dataset shape');
});

// Importing one locale must not pull every locale.
check('locale isolation', () => {
  const es = read('dist/data/emojis-es.js');
  assert.ok(
    !es.includes('emojis-de') && !es.includes('emojis-fr'),
    'es bundle references other locales',
  );
});

// Locale datasets are pure data: no locale file may statically depend on
// another module at all (single-locale consumers stay lean).
check('locale files have no static dependencies', () => {
  const dir = pkgDir + 'dist/data';
  const locales = readdirSync(dir).filter((entry) =>
    /^emojis-.*\.js$/.test(entry),
  );
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
  const Module = require('node:module') as typeof import('node:module') & {
    _resolveFilename: (
      request: string,
      parent: NodeModule | undefined,
      isMain?: boolean,
      options?: { paths?: string[] },
    ) => string;
  };
  const original = Module._resolveFilename;
  Module._resolveFilename = function (request, ...args) {
    if (['react', 'react-dom', 'shipstyles'].includes(request)) {
      throw new Error(`blocked framework import: ${request}`);
    }
    return original.call(this, request, ...args);
  };
  try {
    delete require.cache[requireFromScratch.resolve('emoji-picker-react/data')];
    const data = requireFromScratch(
      'emoji-picker-react/data',
    ) as typeof import('../../src/data');
    assert.ok(data.searchEmojis('smile').length > 0);
  } finally {
    Module._resolveFilename = original;
  }
  for (const [file, content] of [
    ['dist/data/index.js', read('dist/data/index.js')],
    ['dist/esm/data.mjs', staticClosure('dist/esm/data.mjs')],
  ]) {
    assert.ok(
      !/from\s+['"]react['"]|require\(['"]react['"]\)/.test(content),
      `${file} imports react`,
    );
    assert.ok(!/shipstyles/.test(content), `${file} imports shipstyles`);
  }
});

// Primitives must not drag in the default appearance wrapper.
check('primitives exclude default appearance', () => {
  for (const [file, content] of [
    ['dist/primitives/index.js', read('dist/primitives/index.js')],
    [
      'dist/esm/primitives/index.mjs',
      staticClosure('dist/esm/primitives/index.mjs'),
    ],
  ]) {
    for (const marker of [
      'ErrorBoundary',
      'baseVariables',
      '--epr-dark-hover-bg-color',
    ]) {
      assert.ok(!content.includes(marker), `${file} contains ${marker}`);
    }
  }
  // Sanity: the markers exist in the main bundle, so the scan is meaningful.
  const main = staticClosure('dist/esm/index.mjs');
  assert.ok(
    main.includes('ErrorBoundary'),
    'main bundle sanity marker missing',
  );
});

// Lean primitives: the dataset is not loaded up front by the ESM
// primitives entry, but is reachable on demand; the main entry ships it.
check('primitives load the dataset on demand', () => {
  const DATASET_MARKER = 'grinning face with big eyes';
  const primitives = staticClosure('dist/esm/primitives/index.mjs');
  assert.ok(
    !primitives.includes(DATASET_MARKER),
    'primitives ESM eagerly includes the dataset',
  );
  assert.ok(
    /import\(\s*["']\.{1,2}\/[^"']+["']\s*\)/.test(primitives),
    'primitives ESM has no lazy dataset import',
  );
  assert.ok(
    staticClosure('dist/esm/index.mjs').includes(DATASET_MARKER),
    'main ESM is missing the dataset',
  );
});

// Icons are URI-encoded SVG XML. Reserved XML/CSS characters must stay
// escaped so quoted url() values remain valid; browser visual tests verify paint.
check('icon data URIs are encoded SVG XML', () => {
  for (const file of ['dist/index.js', 'dist/primitives/index.js']) {
    const content = read(file);
    // Decode complete JS string literals first: bundled CSS wraps the URI
    // in url("..."), whose escaped quote is not a JS string boundary.
    const icons = [
      ...content.matchAll(
        /(?<!\\)("(?:url\(|data:image\/svg\+xml,)(?:\\.|[^"\\])*"|'(?:url\(|data:image\/svg\+xml,)(?:\\.|[^'\\])*')/g,
      ),
    ]
      .map(
        ([literal]) =>
          (require('node:vm') as typeof import('node:vm')).runInNewContext(
            literal,
          ) as unknown,
      )
      .flatMap((value) => {
        if (typeof value !== 'string') return [];
        const cssUrl = /^url\((["'])(data:image\/svg\+xml,[\s\S]*)\1\)$/.exec(value);
        const uri = cssUrl?.[2] ?? value;
        return uri.startsWith('data:image/svg+xml,')
          ? [uri.slice('data:image/svg+xml,'.length)]
          : [];
      });
    assert.ok(icons.length > 0, `${file} has no embedded SVG icons`);
    for (const encoded of icons) {
      assert.ok(encoded.startsWith('%3Csvg'), `${file} contains raw SVG XML`);
      const svg = decodeURIComponent(encoded);
      const { JSDOM } = requireFromScratch('jsdom') as typeof import('jsdom');
      const xml = new JSDOM(svg, { contentType: 'image/svg+xml' });
      assert.equal(
        xml.window.document.documentElement.localName,
        'svg',
        `${file} has malformed SVG`,
      );
      assert.equal(
        xml.window.document.documentElement.namespaceURI,
        'http://www.w3.org/2000/svg',
      );
      xml.window.close();
    }
  }
});

// RSC: client entries are marked, the data entry is not.
check('client entries carry "use client"', () => {
  for (const file of [
    'dist/index.js',
    'dist/esm/index.mjs',
    'dist/primitives/index.js',
    'dist/esm/primitives/index.mjs',
  ]) {
    assert.ok(/^"use client";/.test(read(file)), `${file} lacks "use client"`);
  }
  for (const file of ['dist/esm/data.mjs', 'dist/data/index.js']) {
    assert.ok(
      !read(file).includes('use client'),
      `${file} must stay server-usable`,
    );
  }
});

// One implementation across ESM entries: main and primitives share chunks.
check('ESM entries share their implementation', () => {
  const chunksOf = (file: string) =>
    new Set(
      (read(file).match(/\.\/(?:\.\.\/)?chunks\/[^"']+/g) || []).map((c) =>
        c.replace(/^.*chunks\//, ''),
      ),
    );
  const main = chunksOf('dist/esm/index.mjs');
  const primitives = chunksOf('dist/esm/primitives/index.mjs');
  assert.ok(
    [...primitives].some((chunk) => main.has(chunk)),
    'main and primitives ESM share no chunk',
  );
});

// Declarations ship for every entry.
check('declarations present', () => {
  for (const file of [
    'dist/index.d.ts',
    'dist/primitives/index.d.ts',
    'dist/data.d.ts',
  ]) {
    assert.ok(read(file).length > 0, `${file} empty`);
  }
  const primitiveTypes = read('dist/primitives/index.d.ts');
  assert.ok(primitiveTypes.includes('Root'), 'primitive types missing Root');
});

// Packed main renders to a string (react-dom/server smoke).
check('packed main server-renders', () => {
  const React = requireFromScratch('react') as typeof import('react');
  const ReactDOMServer = requireFromScratch(
    'react-dom/server',
  ) as typeof import('react-dom/server');
  const { default: EmojiPicker } = requireFromScratch(
    'emoji-picker-react',
  ) as typeof import('../../src/index');
  const html = ReactDOMServer.renderToString(React.createElement(EmojiPicker));
  assert.ok(
    html.includes('aside') || html.includes('EmojiPickerReact'),
    'SSR markup missing picker',
  );
  assert.ok(
    !/\sid="/.test(html.replace(/<style[\s\S]*?<\/style>/g, '')),
    'SSR markup contains library ids',
  );
});

// Packed entries mount, interact, and unmount in a real DOM.
check('packed entries client-mount', async () => {
  const { JSDOM } = requireFromScratch('jsdom') as typeof import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  });
  installGlobals(dom);
  if (typeof global.IntersectionObserver === 'undefined') {
    global.IntersectionObserver = FixtureIntersectionObserver;
  }
  if (typeof global.requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = (cb) => Number(setTimeout(cb, 16));
    global.cancelAnimationFrame = (cb) => clearTimeout(cb);
  }

  const React = requireFromScratch('react') as typeof import('react');
  const ReactDOMClient = requireFromScratch(
    'react-dom/client',
  ) as typeof import('react-dom/client');
  Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
    configurable: true,
    value: true,
  });
  const { default: EmojiPicker } = requireFromScratch(
    'emoji-picker-react',
  ) as typeof import('../../src/index');
  const primitives = requireFromScratch(
    'emoji-picker-react/primitives',
  ) as typeof import('../../src/primitives/index');

  const clicked: EmojiClickData[] = [];
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);
  const actValue: unknown = Reflect.get(React, 'act');
  assert.ok(typeof actValue === 'function', 'React19 fixture requires act');
  const act = actValue as typeof import('react-dom/test-utils').act;
  await act(async () => {
    root.render(
      React.createElement(
        primitives.Root,
        {
          children: null,
          emojiData: undefined,
          onEmojiClick: (emoji: EmojiClickData) => clicked.push(emoji),
        },
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
  const selection: { current: EmojiClickData | null } = { current: null };
  await act(async () => {
    mainRoot.render(
      React.createElement(EmojiPicker, {
        onEmojiClick: (emoji) => {
          selection.current = emoji;
        },
      }),
    );
  });
  const button = mainContainer.querySelector('[data-epr-part="emoji"]');
  assert.ok(button, 'default emoji button mounted');
  button.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.ok(
    selection.current && selection.current.unified,
    'packed onEmojiClick fired',
  );

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
