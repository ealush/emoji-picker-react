import { EmojiStyle, EmojiStyleValue } from '../types/exposedTypes';

const CDN_SETS: ReadonlyArray<string> = [
  EmojiStyle.TWITTER,
  EmojiStyle.GOOGLE,
  EmojiStyle.FACEBOOK,
];

// emoji-datasource publishes one package per image set; native and
// unknown styles use Apple's.
export function cdnUrl(emojiStyle: EmojiStyleValue): string {
  const set = CDN_SETS.includes(emojiStyle) ? emojiStyle : EmojiStyle.APPLE;
  return `https://cdn.jsdelivr.net/npm/emoji-datasource-${set}/img/${set}/64/`;
}
