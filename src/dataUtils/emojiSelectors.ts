// Pure data helpers plus the legacy global registry. This module intentionally
// imports no React components, hooks, or context providers so it can never
// form an import cycle with them. Context-aware lookups live in
// components/context/PickerDataContext instead.
import { cdnUrl } from '../config/cdnUrls';
import { getRegisteredDefaultEmojiData } from '../data/defaultEmojiData';
import skinToneVariations, {
  skinTonesMapped,
} from '../data/skinToneVariations';
import { EmojiData, EmojiStyleValue, SkinTones } from '../types/exposedTypes';

import { DataEmoji, EmojiProperties, WithName } from './DataTypes';

export function emojiNames(emoji: WithName): string[] {
  return emoji[EmojiProperties.name] ?? [];
}

export function addedIn(emoji: DataEmoji): number {
  return parseFloat(emoji[EmojiProperties.added_in] || '0');
}

export function emojiName(emoji?: WithName): string {
  if (!emoji) {
    return '';
  }

  const names = emojiNames(emoji);
  return names[names.length - 1];
}

export function unifiedWithoutSkinTone(unified: string): string {
  const splat = unified.split('-');
  const [skinTone] = splat.splice(1, 1);

  if (skinTonesMapped[skinTone]) {
    return splat.join('-');
  }

  return unified;
}

export function emojiUnified(emoji: DataEmoji, skinTone?: string): string {
  const unified = emoji[EmojiProperties.unified];

  if (!skinTone || !emojiHasVariations(emoji)) {
    return unified;
  }

  return emojiVariationUnified(emoji, skinTone) ?? unified;
}

// WARNING: DO NOT USE DIRECTLY
export function emojiUrlByUnified(
  unified: string,
  emojiStyle: EmojiStyleValue,
): string {
  return `${cdnUrl(emojiStyle)}${unified}.png`;
}

export function emojiVariations(emoji: DataEmoji): string[] {
  return emoji[EmojiProperties.variations] ?? [];
}

export function emojiHasVariations(emoji: DataEmoji): boolean {
  return emojiVariations(emoji).length > 0;
}

export function emojiVariationUnified(
  emoji: DataEmoji,
  skinTone?: string,
): string | undefined {
  return skinTone
    ? emojiVariations(emoji).find((variation) => variation.includes(skinTone))
    : emojiUnified(emoji);
}

// Legacy global lookup (the public top-level `emojiByUnified` export) over
// the registered default dataset. Indexed lazily on first use and again
// only if the registered dataset changes, so importing this module costs
// nothing and does not pull the dataset into a bundle.
let indexedSource: EmojiData | null = null;
let allEmojisByUnified: Record<string, DataEmoji> = Object.create(null);

function registryIndex(): Record<string, DataEmoji> {
  const source = getRegisteredDefaultEmojiData();
  if (source === indexedSource) {
    return allEmojisByUnified;
  }
  indexedSource = source;
  allEmojisByUnified = Object.create(null);
  const groups = source?.emojis ?? {};
  for (const group of Object.keys(groups)) {
    for (const emoji of groups[group]) {
      allEmojisByUnified[emojiUnified(emoji)] = emoji;
      emojiVariations(emoji).forEach((variation) => {
        allEmojisByUnified[variation] = emoji;
      });
    }
  }
  return allEmojisByUnified;
}

export function emojiByUnified(unified?: string): DataEmoji | undefined {
  if (!unified) {
    return;
  }

  const index = registryIndex();
  if (index[unified]) {
    return index[unified];
  }

  const withoutSkinTone = unifiedWithoutSkinTone(unified);
  return index[withoutSkinTone];
}

export function activeVariationFromUnified(unified: string): SkinTones | null {
  const [, suspectedSkinTone] = unified.split('-') as [string, SkinTones];
  return skinToneVariations.includes(suspectedSkinTone)
    ? suspectedSkinTone
    : null;
}
