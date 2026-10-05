import {
  SkinTones,
  SuggestionMode,
  SuggestionModeValue,
} from '../types/exposedTypes';

import { DataEmoji } from './DataTypes';
import { emojiUnified } from './emojiUtils';

const SUGGESTED_LS_KEY = 'epr_suggested';

type SuggestedItem = {
  unified: string;
  original: string;
  count: number;
};

type Suggested = SuggestedItem[];

export function getSuggested(mode?: SuggestionModeValue): Suggested {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const recent = parseSuggested(
      window.localStorage.getItem(SUGGESTED_LS_KEY),
    );

    if (mode === SuggestionMode.FREQUENT) {
      return recent.sort((a, b) => b.count - a.count);
    }

    return recent;
  } catch {
    return [];
  }
}

// Storage is shared by every script on the origin and outlives library
// versions: keep only well-formed entries so a corrupted or foreign value
// cannot crash rendering or selection.
function parseSuggested(raw: string | null): Suggested {
  const parsed: unknown = JSON.parse(raw ?? '[]');
  if (!Array.isArray(parsed)) {
    return [];
  }
  return parsed.filter(
    (item): item is SuggestedItem =>
      !!item &&
      typeof item === 'object' &&
      typeof item.unified === 'string' &&
      typeof item.original === 'string' &&
      typeof item.count === 'number' &&
      Number.isFinite(item.count),
  );
}

export function setSuggested(emoji: DataEmoji, skinTone: SkinTones) {
  const recent = getSuggested();

  const unified = emojiUnified(emoji, skinTone);
  const originalUnified = emojiUnified(emoji);

  let existing = recent.find(({ unified: u }) => u === unified);

  let nextList: SuggestedItem[];

  if (existing) {
    nextList = [existing].concat(recent.filter((i) => i !== existing));
  } else {
    existing = {
      unified,
      original: originalUnified,
      count: 0,
    };
    nextList = [existing, ...recent];
  }

  existing.count++;

  nextList.length = Math.min(nextList.length, 14);

  try {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(SUGGESTED_LS_KEY, JSON.stringify(nextList));
    // Prevents the change from being seen immediately.
  } catch {
    // ignore
  }
}
