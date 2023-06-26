import { SkinTones, SuggestionMode } from '../types/exposedTypes';

import { DataEmoji } from './DataTypes';
import { emojiUnified } from './emojiSelectors';

const SUGGESTED_LS_KEY = 'epr_suggested';

type SuggestedItem = {
  unified: string;
  original: string;
  count: number;
};

type Suggested = SuggestedItem[];

export function getSuggested(mode?: SuggestionMode): Suggested {
  try {
    if (!window?.localStorage) {
      return [];
    }
    const recent = JSON.parse(
      window?.localStorage.getItem(SUGGESTED_LS_KEY) ?? '[]'
    ) as Suggested;

    if (mode === SuggestionMode.FREQUENT) {
      return recent.sort((a, b) => b.count - a.count);
    }

    return recent;
  } catch {
    return [];
  }
}

export function setSuggested(emoji: DataEmoji, skinTone: SkinTones) {
  const recent = getSuggested();

  const unified = emojiUnified(emoji, skinTone);
  const originalUnified = emojiUnified(emoji);

  let existing = recent.find(({ unified: u }) => u === unified);

  let nextList: SuggestedItem[];

  if (existing) {
    nextList = [existing].concat(recent.filter(i => i !== existing));
  } else {
    existing = {
      unified,
      original: originalUnified,
      count: 0
    };
    nextList = [existing, ...recent];
  }

  existing.count++;

  nextList.length = Math.min(nextList.length, 14);

  try {
    window?.localStorage.setItem(SUGGESTED_LS_KEY, JSON.stringify(nextList));
    // Prevents the change from being seen immediately.
  } catch {
    // ignore
  }
}
