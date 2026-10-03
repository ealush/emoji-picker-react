// Pure v5 data operations shared by the picker and `emoji-picker-react/data`.
// No React / ShipStyles imports allowed in this module graph.

import { getPreparedCore, normalizeQuery, normalizeUnified } from './prepare';
import type { EmojiDataOptions, EmojiInfo } from './types';

export type { EmojiDataOptions, EmojiInfo };

const EMPTY_RESULTS: readonly EmojiInfo[] = Object.freeze([]);

/**
 * Bound on distinct memoized queries per prepared core. The memo is shared
 * process-wide per dataset identity (including server use), so unbounded
 * growth is a leak: evict the least recently used entry past this size.
 * 500 distinct recent queries is generous for interactive sessions while
 * keeping worst-case memory proportional to one result window.
 */
const MAX_QUERY_MEMO_SIZE = 500;

function memoizeQuery(
  core: ReturnType<typeof getPreparedCore>,
  normalized: string,
  results: readonly EmojiInfo[],
): void {
  const memo = core.queryMemo;
  if (memo.has(normalized)) {
    memo.delete(normalized);
  } else if (memo.size >= MAX_QUERY_MEMO_SIZE) {
    const oldest = memo.keys().next();
    if (!oldest.done) {
      memo.delete(oldest.value);
    }
  }
  memo.set(normalized, results);
}

/**
 * A record whose names contain the query contains every query character,
 * so it sits in each of those characters' buckets. Scanning the smallest
 * one (buckets keep record order) yields exactly the full-scan matches in
 * the same order, for a fraction of the records.
 */
function smallestCandidateBucket(
  core: ReturnType<typeof getPreparedCore>,
  normalized: string,
): readonly EmojiInfo[] {
  let smallest: readonly EmojiInfo[] = core.records;
  // Code points, matching how buckets are keyed (astral chars stay whole).
  for (const char of Array.from(normalized)) {
    const bucket = core.byChar.get(char);
    if (!bucket) {
      return EMPTY_RESULTS;
    }
    if (bucket.length < smallest.length) {
      smallest = bucket;
    }
  }
  return smallest;
}

/**
 * Lookup by base or variation unified code.
 * Trims/lowercases input, returns the canonical base record or undefined.
 */
export function getEmojiByUnified(
  unified: string,
  options?: EmojiDataOptions,
): EmojiInfo | undefined {
  if (!unified || typeof unified !== 'string') {
    return undefined;
  }
  const normalized = normalizeUnified(unified);
  if (!normalized) {
    return undefined;
  }
  const core = getPreparedCore(options?.emojiData);
  return core.byUnified.get(normalized);
}

/**
 * Dataset search (not a snapshot of one picker instance's visible results).
 * Picker-only layers such as emojiVersion/hiddenEmojis/customEmojis are
 * intentionally not applied here; they remain Root-local filters.
 */
export function searchEmojis(
  query: string,
  options?: EmojiDataOptions,
): readonly EmojiInfo[] {
  const normalized = normalizeQuery(query);
  if (!normalized) {
    return EMPTY_RESULTS;
  }

  const core = getPreparedCore(options?.emojiData);
  const memoized = core.queryMemo.get(normalized);
  if (memoized) {
    memoizeQuery(core, normalized, memoized);
    return Object.freeze([...memoized]) as readonly EmojiInfo[];
  }

  // Single-character queries hit the prepared bucket (same membership as
  // a full scan: joined names contain the char iff some name includes it).
  if (normalized.length === 1) {
    const bucket = core.byChar.get(normalized) ?? EMPTY_RESULTS;
    memoizeQuery(core, normalized, bucket);
    return Object.freeze([...bucket]) as readonly EmojiInfo[];
  }

  const matches: EmojiInfo[] = [];
  for (const record of smallestCandidateBucket(core, normalized)) {
    const names = record.names;
    for (let i = 0; i < names.length; i += 1) {
      if (names[i].includes(normalized)) {
        matches.push(record);
        break;
      }
    }
  }

  memoizeQuery(core, normalized, matches);
  return Object.freeze([...matches]) as readonly EmojiInfo[];
}
