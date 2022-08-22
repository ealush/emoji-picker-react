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

export function emojiUrl(emoji: DataEmoji): string {
  return emojiUrlByUnified(emojiUnified(emoji));
}

export function emojiUnified(emoji: DataEmoji): string {
  return emoji[EmojiProperties.unified];
}

export function emojiUrlByUnified(unified: string): string {
  return `${CDN_URL}${unified}.png`;
}

export function emojiVariations(emoji: DataEmoji): string[] {
  return emoji[EmojiProperties.variations] ?? [];
}

export const allEmojis: DataEmojis = Object.values(emojis).flat();

const CDN_URL =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/';
