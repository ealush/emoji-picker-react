import { Categories } from '../config/categoryConfig';
import { cdnUrl } from '../config/cdnUrls';
import emojis from '../data/emojis';
import skinToneVariations, {
  skinTonesMapped
} from '../data/skinToneVariations';
import { EmojiStyle, SkinTones } from '../types/exposedTypes';

import { DataEmoji, DataEmojis } from './DataTypes';

enum EmojiProperties {
  name = 'n',
  unified = 'u',
  variations = 'v',
  added_in = 'a'
}

export function emojiNames(emoji: DataEmoji): string[] {
  return emoji[EmojiProperties.name] ?? [];
}

export function addedIn(emoji: DataEmoji): number {
  return parseFloat(emoji[EmojiProperties.added_in]);
}

export function emojiName(emoji?: DataEmoji): string {
  if (!emoji) {
    return '';
  }

  return emojiNames(emoji)[0];
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

export function emojisByCategory(category: Categories): DataEmojis {
  // @ts-ignore
  return emojis?.[category] ?? [];
}

// WARNING: DO NOT USE DIRECTLY
export function emojiUrlByUnified(
  unified: string,
  emojiStyle: EmojiStyle
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
  skinTone?: string
): string | undefined {
  return skinTone
    ? emojiVariations(emoji).find(variation => variation.includes(skinTone))
    : emojiUnified(emoji);
}

export function emojiByUnified(unified?: string): DataEmoji | undefined {
  if (!unified) {
    return;
  }

  if (allEmojisByUnified[unified]) {
    return allEmojisByUnified[unified];
  }

  const withoutSkinTone = unifiedWithoutSkinTone(unified);
  return allEmojisByUnified[withoutSkinTone];
}

export const allEmojis: DataEmojis = Object.values(emojis).flat();

const allEmojisByUnified: {
  [unified: string]: DataEmoji;
} = {};

setTimeout(() => {
  allEmojis.reduce((allEmojis, Emoji) => {
    allEmojis[emojiUnified(Emoji)] = Emoji;
    return allEmojis;
  }, allEmojisByUnified);
});

export function activeVariationFromUnified(unified: string): SkinTones | null {
  const [, suspectedSkinTone] = unified.split('-') as [string, SkinTones];
  return skinToneVariations.includes(suspectedSkinTone)
    ? suspectedSkinTone
    : null;
}
