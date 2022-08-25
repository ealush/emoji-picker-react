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
  cdnUrl: string,
  emoji: DataEmoji,
  skinTone?: string
): string {
  return emojiUrlByUnified(cdnUrl, emojiUnified(emoji, skinTone));
}

export function emojiUnified(emoji: DataEmoji, skinTone?: string): string {
  const unified = emoji[EmojiProperties.unified];

  if (!skinTone || !emojiHasVariations(emoji)) {
    return unified;
  }

  return emojiVariationUnified(emoji, skinTone) ?? unified;
}

export function emojiUrlByUnified(cdnUrl: string, unified: string): string {
  return `${cdnUrl}${unified}.png`;
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

export const allEmojis: DataEmojis = Object.values(emojis).flat();
