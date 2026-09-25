// Pure v5 data operations shared by the picker and `emoji-picker-react/data`.
// No React / ShipStyles imports allowed in this module graph.

import { getPreparedCore, normalizeQuery, normalizeUnified } from './prepare';
import type { EmojiDataOptions, EmojiInfo } from './types';

export type { EmojiDataOptions, EmojiInfo };

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
    return Object.freeze([]) as readonly EmojiInfo[];
  }

  const core = getPreparedCore(options?.emojiData);
  const memoized = core.queryMemo.get(normalized);
  if (memoized) {
    return Object.freeze([...memoized]) as readonly EmojiInfo[];
  }

  const matches: EmojiInfo[] = [];
  for (const record of core.records) {
    const names = record.names;
    for (let i = 0; i < names.length; i += 1) {
      if (names[i].includes(normalized)) {
        matches.push(record);
        break;
      }
    }
  }

  core.queryMemo.set(normalized, matches);
  return Object.freeze([...matches]) as readonly EmojiInfo[];
}
