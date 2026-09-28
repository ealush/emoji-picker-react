// React 16.8 runtime fixture (docs/v5/REACT_COMPATIBILITY.md §2).
// Consumes the bundled picker with react@16.8 + react-dom@16.8 only:
// mount/unmount, click selection, keyboard smoke path, SSR render,
// hydration, and zero library-owned DOM IDs. Run from this directory:
//   node react16-check.js /path/to/picker.cjs
const { JSDOM } = require('jsdom');

const bundlePath = process.argv[2] || './picker.cjs';

function makeDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
  });
  for (const key of [
    'window',
    'document',
    'navigator',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'Element',
    'HTMLElement',
    'Node',
    'Event',
    'KeyboardEvent',
    'MouseEvent',
    'getComputedStyle',
  ]) {
    if (dom.window[key] !== undefined && global[key] === undefined) {
      global[key] = dom.window[key];
    }
  }
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  if (!global.requestAnimationFrame) {
    global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
    global.cancelAnimationFrame = (cb) => clearTimeout(cb);
  }
  if (typeof global.IntersectionObserver === 'undefined') {
    // Mirrors test/setupTests.ts: immediately report targets intersecting.
    global.IntersectionObserver = class MockIntersectionObserver {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        this.callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 1,
              boundingClientRect: {},
              intersectionRect: {},
              rootBounds: null,
              target,
              time: Date.now(),
            },
          ],
          this,
        );
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
  }
  return dom;
}

async function main() {
  const failures = [];
  const check = (name, fn) => {
    try {
      const result = fn();
      if (result && typeof result.then === 'function') {
        return result.then(
          () => console.log(`ok: ${name}`),
          (error) => {
            failures.push(name);
            console.error(`FAIL: ${name}: ${error && error.stack}`);
          },
        );
      }
      console.log(`ok: ${name}`);
    } catch (error) {
      failures.push(name);
      console.error(`FAIL: ${name}: ${error && error.stack}`);
    }
    return undefined;
  };

  makeDom();
  const React = require('react');
  const ReactDOM = require('react-dom');
  const ReactDOMServer = require('react-dom/server');
  console.log(
    `react ${React.version} / react-dom ${require('react-dom/package.json').version}`,
  );

  const pickerModule = require(bundlePath);
  const EmojiPicker = pickerModule.default || pickerModule.EmojiPicker;
  if (typeof EmojiPicker !== 'function') {
    throw new Error('default EmojiPicker export not found');
  }

  const minimalData = {
    categories: {
      smileys_people: { category: 'smileys_people', name: 'Smileys & People' },
      animals_nature: { category: 'animals_nature', name: 'Animals & Nature' },
    },
    emojis: {
      smileys_people: [{ n: ['face', 'grinning face'], u: '1f600', a: '1' }],
      animals_nature: [{ n: ['cat'], u: '1f431', a: '0.6' }],
    },
  };

  await check('mount and unmount', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(
      React.createElement(EmojiPicker, { emojiData: minimalData }),
      container,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (!container.querySelector('aside')) {
      throw new Error('picker root not mounted');
    }
    if (container.querySelectorAll('[id]').length !== 0) {
      throw new Error('library-owned DOM ids present');
    }
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  await check('click selection', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    let clicked = null;
    ReactDOM.render(
      React.createElement(EmojiPicker, {
        emojiData: minimalData,
        onEmojiClick: (data) => {
          clicked = data;
        },
      }),
      container,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    const button = container.querySelector('button[aria-label="grinning face"]');
    if (!button) {
      throw new Error('emoji button not found');
    }
    button.dispatchEvent(
      new domWindowMouseEvent(button, 'click'),
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (!clicked || clicked.unified !== '1f600') {
      throw new Error(`onEmojiClick missing, got ${JSON.stringify(clicked)}`);
    }
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  await check('keyboard search smoke path', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(
      React.createElement(EmojiPicker, { emojiData: minimalData }),
      container,
    );
    await new Promise((resolve) => setTimeout(resolve, 50));
    const input = container.querySelector('input');
    if (!input) {
      throw new Error('search input not found');
    }
    input.focus();
    input.dispatchEvent(
      new window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    const active = document.activeElement;
    if (!active || active === input || active === document.body) {
      throw new Error('ArrowDown did not move focus into the picker');
    }
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  await check('SSR render with react-dom/server', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(EmojiPicker, { emojiData: minimalData }),
    );
    if (!html.includes('aside') && !html.includes('EmojiPickerReact')) {
      throw new Error('SSR markup missing picker root');
    }
    // Style blocks carry asset text (base64 in the real build); only
    // element markup counts for the no-library-ID contract.
    const markup = html.replace(/<style[\s\S]*?<\/style>/g, '');
    if (/\sid=/.test(markup)) {
      throw new Error('SSR markup contains library-owned ids');
    }
  });

  await check('hydration with ReactDOM.hydrate', async () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(EmojiPicker, { emojiData: minimalData }),
    );
    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = html;
    ReactDOM.hydrate(
      React.createElement(EmojiPicker, { emojiData: minimalData }),
      container,
    );
    await new Promise((resolve) => setTimeout(resolve, 80));
    if (!container.querySelector('aside')) {
      throw new Error('hydrated root missing');
    }
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  function domWindowMouseEvent(target, type) {
    const event = document.createEvent('MouseEvents');
    event.initEvent(type, true, true);
    return event;
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} fixture check(s) failed`);
    process.exit(1);
  }
  console.log('\nreact16 fixture: all checks passed');
  process.exit(0);
}

main().catch((error) => {
  console.error(error && error.stack);
  process.exit(1);
});
