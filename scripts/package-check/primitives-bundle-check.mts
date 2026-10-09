import { Categories } from '../../src/types/exposedTypes';
import { FixtureIntersectionObserver } from '../fixtureDom.js';
import type { PickerProps } from '../../src/index';
import type { EmojiClickData, EmojiData } from '../../src/types/exposedTypes';
import process from 'node:process';
// Execute the minified/tree-shaken public-entry consumer, not the full
// library exports: dropping unused registration must retain used CSS.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!doctype html><html><body><div id="app"></div></body></html>',
  {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  },
);
for (const key of [
  'window',
  'document',
  'navigator',
  'Element',
  'HTMLElement',
  'getComputedStyle',
] as const) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: dom.window[key],
  });
}
globalThis.requestAnimationFrame = (callback) =>
  Number(setTimeout(callback, 0));
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.IntersectionObserver = FixtureIntersectionObserver;
// jsdom has no layout engine; provide the same visible viewport geometry
// that the real-browser suites exercise, rather than a zero-size host.
Object.defineProperty(dom.window.HTMLElement.prototype, 'clientHeight', {
  configurable: true,
  get() {
    return this.tagName === 'BUTTON' ? 40 : this.tagName === 'H2' ? 35 : 450;
  },
});
Object.defineProperty(dom.window.HTMLElement.prototype, 'clientWidth', {
  configurable: true,
  get() {
    return this.tagName === 'BUTTON' ? 40 : 350;
  },
});
dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
  const top = this.tagName === 'BUTTON' ? 40 : 0;
  return {
    x: 0,
    y: top,
    top,
    left: 0,
    right: this.clientWidth,
    bottom: top + this.clientHeight,
    width: this.clientWidth,
    height: this.clientHeight,
    toJSON() {},
  };
};
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', {
  configurable: true,
  value: true,
});

// The scratch consumer installs React19 even when this checkout develops on React18.
const React = await import('react');
const actValue: unknown = Reflect.get(React, 'act');
assert.ok(typeof actValue === 'function', 'React19 fixture requires act');
const act = actValue as typeof import('react-dom/test-utils').act;
const { createRoot } = await import('react-dom/client');
const { Picker } = (await import(pathToFileURL(process.argv[2]).href)) as {
  Picker: React.ComponentType<PickerProps>;
};
const isDefault = process.argv[3] === 'default';
const categories: NonNullable<PickerProps['categories']> = isDefault
  ? [Categories.SMILEYS_PEOPLE, Categories.ANIMALS_NATURE]
  : [Categories.SMILEYS_PEOPLE];
const data: EmojiData = {
  categories: {
    smileys_people: { category: Categories.SMILEYS_PEOPLE, name: 'Faces' },
    animals_nature: { category: Categories.ANIMALS_NATURE, name: 'Animals' },
  },
  emojis: {
    smileys_people: [
      { u: '1f600', n: ['grinning face'], a: '1' },
      { u: '1f603', n: ['happy face'], a: '0.6' },
    ],
    animals_nature: [{ u: '1f98a', n: ['fox'], a: '3' }],
  },
};
const selected: string[] = [];
const container = document.getElementById('app');
assert.ok(container, 'fixture app container missing');
const root = createRoot(container);
await act(async () => {
  root.render(
    React.createElement(Picker, {
      emojiData: data,
      onEmojiClick: (emoji: EmojiClickData) => selected.push(emoji.unified),
      categories,
      style: { width: 350, height: 450 },
    }),
  );
});
for (const [part, property, value] of [
  ['root', 'display', 'flex'],
  ['root', 'position', 'relative'],
  ['panel', 'display', 'flex'],
  ['viewport', 'overflowY', 'scroll'],
] as const) {
  const element: Element | null = container.querySelector(
    `[data-epr-part="${part}"]`,
  );
  assert.ok(element, `missing ${part}`);
  assert.equal(
    getComputedStyle(element)[property],
    value,
    `${part} ${property} CSS was removed`,
  );
}
const cells = () => [...container.querySelectorAll('[role="gridcell"]')];
assert.equal(
  cells().length,
  isDefault ? 3 : 2,
  'minified consumer lost grid items',
);
await act(async () => {
  const input = container.querySelector('input');
  assert.ok(input, 'search input missing');
  input.focus();
  input.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
  );
  await new Promise((resolve) => setTimeout(resolve, 10));
});
assert.deepEqual(
  selected,
  ['1f600'],
  'keyboard selection lost after tree shaking',
);
await act(async () => {
  root.render(
    React.createElement(Picker, {
      emojiData: data,
      categories,
      searchValue: 'happy',
    }),
  );
  await new Promise((resolve) => setTimeout(resolve, 160));
});
await act(async () => new Promise((resolve) => setTimeout(resolve, 160)));
assert.equal(container.querySelector('input')!.value, 'happy');
assert.equal(
  cells().length,
  1,
  'controlled native search lost after tree shaking',
);
assert.equal(cells()[0].getAttribute('data-epr-unified'), '1f603');
if (isDefault) {
  for (const part of ['preview', 'skin-tone']) {
    assert.ok(
      container.querySelector(`[data-epr-part="${part}"]`),
      `default bundle lost ${part}`,
    );
  }
  assert.ok(
    container.querySelector('[role="tablist"] svg'),
    'default navigation/icons were removed',
  );
}
await act(async () => root.unmount());
dom.window.close();
console.log(
  `ok: minified packed ${isDefault ? 'default picker' : 'primitives'} preserve CSS, keyboard selection and search`,
);
