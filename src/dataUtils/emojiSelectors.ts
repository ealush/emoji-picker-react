import { Categories } from './../config/categoryConfig';
import { cdnUrl } from '../config/cdnUrls';
import { EmojiStyle } from '../config/config';
import emojis from '../data/emojis';
import { DataEmoji, DataEmojis } from './DataTypes';

enum EmojiProperties {
  name = 'n',
  unified = 'u',
  variations = 'v'
}

export function emojiNames(emoji: DataEmoji): string[] {
  return emoji[EmojiProperties.name] ?? [];
}

export function emojiName(emoji: DataEmoji): string {
  return emojiNames(emoji)[0];
}

export function emojiUrl(
  emojiStyle: EmojiStyle,
  emoji: DataEmoji,
  skinTone?: string
): string {
  return emojiUrlByUnified(emojiStyle, emojiUnified(emoji, skinTone));
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

export function emojiUrlByUnified(
  emojiStyle: EmojiStyle,
  unified: string
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

export function emojiByUnified(unified: string): DataEmoji | undefined {
  return allEmojisByUnified[unified];
}

export const allEmojis: DataEmojis = Object.values(emojis).flat();

// FIXME: Consider deferring
export const allEmojisByUnified: {
  [unified: string]: DataEmoji;
} = allEmojis.reduce(
  (allEmojis, Emoji) => {
    allEmojis[emojiUnified(Emoji)] = Emoji;
    return allEmojis;
  },
  {} as {
    [unified: string]: DataEmoji;
  }
);
