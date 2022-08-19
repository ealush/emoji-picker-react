import { DataEmoji } from './DataTypes';

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

const CDN_URL =
  'https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/';

enum EmojiProperties {
  name = 'n',
  unified = 'u',
  variations = 'v'
}
