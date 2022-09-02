import { SkinTones } from '../types/exposedTypes';
import { DataEmoji } from './DataTypes';
import { emojiUnified } from './emojiSelectors';

const RECENTLY_USED_LS_KEY = 'epr_recentlyUsed';

type RecentlyUsedItem = {
  unified: string;
  original: string;
  count: number;
};

type RecentlyUsed = RecentlyUsedItem[];

export function getRecentlyUsed(): RecentlyUsed {
  if (!window?.localStorage) {
    return [];
  }
  try {
    return JSON.parse(
      window?.localStorage.getItem(RECENTLY_USED_LS_KEY) ?? '[]'
    );
  } catch {
    return [];
  }
}

export function setRecentlyUsed(emoji: DataEmoji, skinTone: SkinTones) {
  const recent = getRecentlyUsed();

  const unified = emojiUnified(emoji, skinTone);
  const originalUnified = emojiUnified(emoji);

  let existing = recent.find(({ unified: u }) => u === unified);

  let nextList;

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
    window?.localStorage.setItem(
      RECENTLY_USED_LS_KEY,
      JSON.stringify(nextList)
    );
  } catch {
    // ignore
  }
}
