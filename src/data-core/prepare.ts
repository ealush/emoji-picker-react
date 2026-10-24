// Pure immutable prepared-data core for v5.
//
// Requirements (see also docs/v5/DATA_API.md):
// - prepare/search-index immutable emoji data outside transient UI state;
// - cache prepared base data by `emojiData` object identity (WeakMap);
// - default packaged data shares one prepared core across Roots;
// - caller-provided data is never mutated or frozen;
// - prepared public records are deeply frozen once and safely shared;
// - no JSON stringify/parse of the full dataset per Root;
// - no React / ShipStyles imports in this module graph.

import { defaultEmojiDataOrEmpty } from '../data/defaultEmojiData';
import { parseNativeEmoji } from '../dataUtils/parseNativeEmoji';
import type { EmojiData } from '../types/exposedTypes';

import type { EmojiInfo } from './types';

export interface PreparedCore {
  /** Stable dataset order of canonical base records. */
  readonly records: readonly EmojiInfo[];
  /** Base unified -> record plus variation unified -> base record. */
  readonly byUnified: ReadonlyMap<string, EmojiInfo>;
  /**
   * Single-character bucket: char -> base records whose joined lowercase
   * names include it, in dataset order. Preserves v4's useful O(1)
   * first-keystroke narrowing on top of the shared immutable core, so
   * cold single-char queries never pay a full scan.
   */
  readonly byChar: ReadonlyMap<string, readonly EmojiInfo[]>;
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

function readStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return (raw.filter((value) => typeof value === 'string') as string[]).map(
    (value) => value.toLowerCase(),
  );
}

function appendEntry(
  byUnified: Map<string, EmojiInfo>,
  byCharMutable: Map<string, EmojiInfo[]>,
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

  const addedIn = String((entry as { a?: unknown }).a ?? '');

  // Freeze the arrays readStringArray owns directly, without copying them
  // a second time. Caller arrays are never mutated or frozen.
  const info: EmojiInfo = Object.freeze({
    unified,
    emoji: parseNativeEmoji(unified),
    name: names[names.length - 1] || '',
    names: Object.freeze(names),
    variations: Object.freeze(variations),
    addedIn,
  });
  records.push(info);
  byUnified.set(unified, info);
  for (const variation of info.variations) {
    if (!byUnified.has(variation)) {
      byUnified.set(variation, info);
    }
  }
  indexCharBucket(byCharMutable, names, info);
}

// Records are indexed in order. A bucket already ending in this record
// has seen the character, avoiding a temporary Set for every emoji.
function indexCharBucket(
  byCharMutable: Map<string, EmojiInfo[]>,
  names: readonly string[],
  info: EmojiInfo,
): void {
  for (const char of names.join('')) {
    const bucket = byCharMutable.get(char);
    if (bucket) {
      if (bucket[bucket.length - 1] !== info) bucket.push(info);
    } else {
      byCharMutable.set(char, [info]);
    }
  }
}

export function getPreparedCore(emojiData?: EmojiData): PreparedCore {
  const source = (emojiData ?? defaultEmojiDataOrEmpty()) as EmojiData;
  const cached = coreCache.get(source);
  if (cached) {
    return cached;
  }

  prepareCount += 1;

  const byUnified = new Map<string, EmojiInfo>();
  const byCharMutable = new Map<string, EmojiInfo[]>();
  const records: EmojiInfo[] = [];

  const groups = source.emojis ?? {};

  for (const key of Object.keys(groups)) {
    const list = groups[key] ?? [];
    for (const entry of list) {
      appendEntry(byUnified, byCharMutable, records, entry);
    }
  }

  byCharMutable.forEach(Object.freeze);

  const core: PreparedCore = {
    records,
    byUnified,
    byChar: byCharMutable,
    queryMemo: new Map<string, readonly EmojiInfo[]>(),
  };

  coreCache.set(source, core);
  return core;
}
