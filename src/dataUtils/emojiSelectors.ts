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

export function emojiUrl(emoji: DataEmoji, skinTone?: string): string {
  return emojiUrlByUnified(emojiUnified(emoji, skinTone));
}

export function emojiUnified(emoji: DataEmoji, skinTone?: string): string {
  const unified = emoji[EmojiProperties.unified];

  if (!skinTone || !emojiHasVariations(emoji)) {
    return unified;
  }

  return emojiVariationUnified(emoji, skinTone) ?? unified;
}

export function emojiUrlByUnified(unified: string): string {
  return `${CDN_URL}${unified}.png`;
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
  return emojiVariations(emoji).find(variation => variation.includes(skinTone));
}

export const allEmojis: DataEmojis = Object.values(emojis).flat();

const CDN_URL =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/';
