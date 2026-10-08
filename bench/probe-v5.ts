// v5 measurement probe, bundled per checkout with:
//   esbuild bench/probe-v5.ts --alias:@c=<checkout>/src ...
// Uses the REAL v5 modules: shared prepared core, dataset search, and the
// default picker mount path.
import { getPreparedCore } from '@c/data-core/prepare';
import { searchEmojis } from '@c/data-core/search';
import { __getPrepareCount, __resetPrepareCount } from '@c/data-core/prepare';
import defaultEmojiData from '@c/data/emojis';
import Picker from '@c/index';
import type { EmojiData } from '@c/types/exposedTypes';

const dataset = defaultEmojiData as unknown as EmojiData;

function now(): number {
  return performance.now();
}

export function prepareOnce(): void {
  getPreparedCore(dataset);
}

// Cold preparation: building the prepared core for a dataset identity not
// seen before. The copy that supplies the fresh identity is made outside
// the timer; v5 never clones the dataset itself.
export function coldPrepare(): number {
  const fresh = JSON.parse(JSON.stringify(dataset)) as EmojiData;
  const start = now();
  getPreparedCore(fresh);
  return now() - start;
}

export function resetQueryMemo(): void {
  getPreparedCore(dataset).queryMemo.clear();
}

export function coldQuery(query: string): number {
  const start = now();
  searchEmojis(query);
  return now() - start;
}

export function baseBuilds(): number {
  return __getPrepareCount();
}

export function resetBaseBuilds(): void {
  __resetPrepareCount();
}

type ReactDeps = {
  React: typeof import('react');
  ReactDOMClient: typeof import('react-dom/client');
  flushSync: (fn: () => void) => void;
};

let deps: ReactDeps | null = null;

export function setReactDeps(next: ReactDeps): void {
  deps = next;
}

function mountPicker(emojiData?: EmojiData): number {
  if (!deps) {
    throw new Error('setReactDeps() before mounting');
  }
  const { React, ReactDOMClient, flushSync } = deps;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);
  const start = now();
  flushSync(() => {
    root.render(React.createElement(Picker, { emojiData }));
  });
  const elapsed = now() - start;
  root.unmount();
  container.remove();
  return elapsed;
}

export function mountOne(): number {
  return mountPicker();
}

function mountTenWith(emojiData?: EmojiData): number {
  if (!deps) {
    throw new Error('setReactDeps() before mounting');
  }
  const { React, ReactDOMClient, flushSync } = deps;
  const containers: HTMLElement[] = [];
  const roots: Array<import('react-dom/client').Root> = [];
  for (let i = 0; i < 10; i += 1) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    containers.push(container);
    roots.push(ReactDOMClient.createRoot(container));
  }
  const start = now();
  flushSync(() => {
    for (const root of roots) {
      root.render(React.createElement(Picker, { emojiData }));
    }
  });
  const elapsed = now() - start;
  for (const root of roots) {
    root.unmount();
  }
  for (const container of containers) {
    container.remove();
  }
  return elapsed;
}

export function mountTen(): number {
  return mountTenWith();
}

/** A new dataset identity must be prepared once by the mounted pickers. */
export function mountTenFreshDataset(): number {
  const fresh = JSON.parse(JSON.stringify(dataset)) as EmojiData;
  return mountTenWith(fresh);
}
