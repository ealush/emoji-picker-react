// Execute the minified/tree-shaken public-entry consumer, not the full
// library exports: dropping unused registration must retain used CSS.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
for (const key of ['window', 'document', 'navigator', 'Element', 'HTMLElement', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, { configurable: true, value: dom.window[key] });
}
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.IntersectionObserver = class {
  constructor(callback) { this.callback = callback; }
  observe(target) { this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }], this); }
  unobserve() {}
  disconnect() {}
};
// jsdom has no layout engine; provide the same visible viewport geometry
// that the real-browser suites exercise, rather than a zero-size host.
Object.defineProperty(dom.window.HTMLElement.prototype, 'clientHeight', { configurable: true, get() { return this.tagName === 'BUTTON' ? 40 : this.tagName === 'H2' ? 35 : 450; } });
Object.defineProperty(dom.window.HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.tagName === 'BUTTON' ? 40 : 350; } });
dom.window.HTMLElement.prototype.getBoundingClientRect = function () {
  const top = this.tagName === 'BUTTON' ? 40 : 0;
  return { x: 0, y: top, top, left: 0, right: this.clientWidth, bottom: top + this.clientHeight, width: this.clientWidth, height: this.clientHeight, toJSON() {} };
};
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { Picker } = await import(pathToFileURL(process.argv[2]).href);
const isDefault = process.argv[3] === 'default';
const categories = isDefault ? ['smileys_people', 'animals_nature'] : ['smileys_people'];
const data = {
  categories: {
    smileys_people: { category: 'smileys_people', name: 'Faces' },
    animals_nature: { category: 'animals_nature', name: 'Animals' },
  },
  emojis: { smileys_people: [
    { u: '1f600', n: ['grinning face'], a: '1' },
    { u: '1f603', n: ['happy face'], a: '0.6' },
  ], animals_nature: [{ u: '1f98a', n: ['fox'], a: '3' }] },
};
const selected = [];
const container = document.getElementById('app');
const root = createRoot(container);
await React.act(async () => {
  root.render(React.createElement(Picker, {
    emojiData: data, onEmojiClick: emoji => selected.push(emoji.unified),
    categories,
    style: { width: 350, height: 450 },
  }));
});
for (const [part, property, value] of [
  ['root', 'display', 'flex'], ['root', 'position', 'relative'],
  ['panel', 'display', 'flex'], ['viewport', 'overflowY', 'scroll'],
]) {
  const element = container.querySelector(`[data-epr-part="${part}"]`);
  assert.ok(element, `missing ${part}`);
  assert.equal(getComputedStyle(element)[property], value, `${part} ${property} CSS was removed`);
}
const cells = () => [...container.querySelectorAll('[role="gridcell"]')];
assert.equal(cells().length, isDefault ? 3 : 2, 'minified consumer lost grid items');
await React.act(async () => {
  const input = container.querySelector('input');
  input.focus();
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await new Promise(resolve => setTimeout(resolve, 10));
});
assert.deepEqual(selected, ['1f600'], 'keyboard selection lost after tree shaking');
await React.act(async () => {
  root.render(React.createElement(Picker, { emojiData: data, categories, searchValue: 'happy' }));
  await new Promise(resolve => setTimeout(resolve, 160));
});
await React.act(async () => new Promise(resolve => setTimeout(resolve, 160)));
assert.equal(container.querySelector('input').value, 'happy');
assert.equal(cells().length, 1, 'controlled native search lost after tree shaking');
assert.equal(cells()[0].getAttribute('data-epr-unified'), '1f603');
if (isDefault) {
  for (const part of ['preview', 'skin-tone']) {
    assert.ok(container.querySelector(`[data-epr-part="${part}"]`), `default bundle lost ${part}`);
  }
  assert.ok(container.querySelector('[role="tablist"] svg'), 'default navigation/icons were removed');
}
await React.act(async () => root.unmount());
dom.window.close();
console.log(`ok: minified packed ${isDefault ? 'default picker' : 'primitives'} preserve CSS, keyboard selection and search`);
