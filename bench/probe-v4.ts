// v4 measurement probe, bundled per checkout with:
//   esbuild bench/probe-v4.ts --alias:@c=<checkout>/src ...
// Uses the REAL v4 modules where they exist (filter narrowing helpers,
// dataset, default picker mount path). The v4 provider built its lookup
// by deep-cloning the dataset per picker instance; prepareOnce replicates
// that exact pre-refactor cost (JSON clone + unified/variation map + char
// search index, as PickerDataContext did) because the refactor removed
// that code path from the branch.
import {
  filterEmojiObjectByKeyword,
  findLongestMatch,
  type FilterDict,
} from '@c/hooks/useFilter';
import defaultEmojiData from '@c/data/emojis';
import Picker from '@c/index';
import { DataEmoji, EmojiProperties as Keys } from '@c/dataUtils/DataTypes';

type BaseIndex = {
  allByUnified: Record<string, DataEmoji>;
  searchIndex: Record<string, Record<string, DataEmoji>>;
};

let base: BaseIndex | null = null;
let seqMemo: Record<string, FilterDict> = {};

function now(): number {
  return performance.now();
}

export function prepareOnce(): void {
  // Pre-refactor provider cost, replicated field-for-field.
  const cloned = JSON.parse(JSON.stringify(defaultEmojiData)) as {
    emojis: Record<string, DataEmoji[]>;
  };
  const allByUnified: Record<string, DataEmoji> = Object.create(null);
  const searchIndex: Record<string, Record<string, DataEmoji>> =
    Object.create(null);
  const allEmojis: DataEmoji[] = Object.values(cloned.emojis).flat();
  for (const emoji of allEmojis) {
    const unified = emoji[Keys.unified];
    allByUnified[unified] = emoji;
    for (const variation of emoji[Keys.variations] ?? []) {
      allByUnified[variation] = emoji;
    }
    for (const char of (emoji[Keys.name] || []).join('').toLowerCase()) {
      searchIndex[char] = searchIndex[char] ?? Object.create(null);
      searchIndex[char][unified] = emoji;
    }
  }
  base = { allByUnified, searchIndex };
}

// Cold preparation: v4 paid the full clone + index build per picker
// instance, so all of prepareOnce() is the equivalent timed work.
export function coldPrepare(): number {
  const start = now();
  prepareOnce();
  return now() - start;
}

export function resetQueryMemo(): void {
  seqMemo = {};
}

function searchOnce(query: string): void {
  if (!base) {
    throw new Error('prepareOnce() before searching');
  }
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return;
  }
  if (seqMemo[normalized]) {
    return;
  }
  const filter = base.searchIndex;
  if (filter[normalized] || normalized.length <= 1) {
    seqMemo[normalized] = filter[normalized] ?? {};
    return;
  }
  const longestMatch = findLongestMatch(normalized, filter);
  if (!longestMatch) {
    seqMemo[normalized] = {};
    return;
  }
  seqMemo[normalized] = filterEmojiObjectByKeyword(longestMatch, normalized);
}

export function coldQuery(query: string): number {
  const start = now();
  searchOnce(query);
  return now() - start;
}

export function baseBuilds(): number {
  // v4 rebuilt the base index per mount; the count is structural, not timed.
  return -1;
}

export function resetBaseBuilds(): void {}

type ReactDeps = {
  React: typeof import('react');
  ReactDOMClient: typeof import('react-dom/client');
  flushSync: (fn: () => void) => void;
};

let deps: ReactDeps | null = null;

export function setReactDeps(next: ReactDeps): void {
  deps = next;
}

function mountWith(count: number): number {
  if (!deps) {
    throw new Error('setReactDeps() before mounting');
  }
  const { React, ReactDOMClient, flushSync } = deps;
  const containers: HTMLElement[] = [];
  const roots: Array<{ unmount: () => void }> = [];
  for (let i = 0; i < count; i += 1) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    containers.push(container);
    roots.push(ReactDOMClient.createRoot(container));
  }
  const start = now();
  flushSync(() => {
    for (const root of roots) {
      root.render(React.createElement(Picker, { emojiData: undefined }));
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

export function mountOne(): number {
  return mountWith(1);
}

export function mountTen(): number {
  return mountWith(10);
}
