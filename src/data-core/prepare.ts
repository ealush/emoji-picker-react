// Pure immutable prepared-data core for v5.
//
// Requirements (docs/v5/PERFORMANCE.md §1, docs/v5/DATA_API.md):
// - prepare/search-index immutable emoji data outside transient UI state;
// - cache prepared base data by `emojiData` object identity (WeakMap);
// - default packaged data shares one prepared core across Roots;
// - caller-provided data is never mutated or frozen;
// - prepared public records are deeply frozen once and safely shared;
// - no JSON stringify/parse of the full dataset per Root;
// - no React / ShipStyles imports in this module graph.

import defaultEmojiData from '../data/emojis';
import type { EmojiData } from '../types/exposedTypes';

import type { EmojiInfo } from './types';

export interface PreparedCore {
  /** Stable dataset order of canonical base records. */
  readonly records: readonly EmojiInfo[];
  /** Base unified -> record plus variation unified -> base record. */
  readonly byUnified: ReadonlyMap<string, EmojiInfo>;
  /** Per-core query memo: normalized query -> matching records. */
  readonly queryMemo: Map<string, readonly EmojiInfo[]>;
}

const coreCache = new WeakMap<object, PreparedCore>();

// Instrumentation for the deterministic multi-root sharing invariant:
// mounting N Roots against the same dataset identity must construct the
// base index exactly once. Tests assert on this counter, not on timing.
let prepareCount = 0;

export function __getPrepareCount(): number {
  return prepareCount;
}

export function __resetPrepareCount(): void {
  prepareCount = 0;
}

export function __clearCoreCacheForTest(): void {
  // WeakMap has no clear(); tests that need a cold cache can use a fresh
  // dataset object identity instead. Kept as explicit no-op guard.
}

export function normalizeUnified(input: string): string {
  return input.trim().toLowerCase();
}

export function normalizeQuery(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input.trim().toLowerCase();
}

function toEmojiInfo(
  unified: string,
  names: readonly string[],
  variations: readonly string[] | undefined,
  addedIn: string,
): EmojiInfo {
  return Object.freeze({
    unified,
    names: Object.freeze([...names]),
    variations: Object.freeze([...(variations ?? [])]),
    addedIn,
  });
}

function readStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  return (raw.filter((n) => typeof n === 'string') as string[]).map((n) =>
    n.toLowerCase(),
  );
}

function appendEntry(
  byUnified: Map<string, EmojiInfo>,
  records: EmojiInfo[],
  entry: unknown,
): void {
  // Never mutate caller data: read raw fields defensively.
  const rawUnified = (entry as { u?: unknown }).u;
  if (typeof rawUnified !== 'string' || rawUnified.length === 0) {
    return;
  }
  const unified = rawUnified.toLowerCase();
  if (byUnified.has(unified)) {
    return;
  }

  const names = readStringArray((entry as { n?: unknown }).n);
  const variations = readStringArray((entry as { v?: unknown }).v);

  const rawAddedIn = (entry as { a?: unknown }).a;
  const addedIn =
    typeof rawAddedIn === 'string' ? rawAddedIn : String(rawAddedIn ?? '');

  const info = toEmojiInfo(unified, names, variations, addedIn);
  records.push(info);
  byUnified.set(unified, info);
  for (const variation of info.variations) {
    if (!byUnified.has(variation)) {
      byUnified.set(variation, info);
    }
  }
}

export function getPreparedCore(emojiData?: EmojiData): PreparedCore {
  const source = (emojiData ?? defaultEmojiData) as EmojiData;
  const cached = coreCache.get(source);
  if (cached) {
    return cached;
  }

  prepareCount += 1;

  const byUnified = new Map<string, EmojiInfo>();
  const records: EmojiInfo[] = [];

  const groups = source.emojis ?? {};

  for (const key of Object.keys(groups)) {
    const list = groups[key] ?? [];
    for (const entry of list) {
      appendEntry(byUnified, records, entry);
    }
  }

  const core: PreparedCore = {
    records,
    byUnified,
    queryMemo: new Map<string, readonly EmojiInfo[]>(),
  };

  coreCache.set(source, core);
  return core;
}
