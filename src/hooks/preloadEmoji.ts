import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiVariations } from '../dataUtils/emojiUtils';
import { EmojiStyleValue } from '../types/exposedTypes';

export function preloadEmoji(
  getEmojiUrl: GetEmojiUrl,
  emoji: undefined | DataEmoji,
  emojiStyle: EmojiStyleValue,
): void {
  if (!emoji) {
    return;
  }

  const unified = emojiUnified(emoji);

  if (preloadedEmojs.has(unified)) {
    return;
  }
  preloadedEmojs.add(unified);

  emojiVariations(emoji)
    .concat(unified)
    .forEach((variation) => {
      const emojiUrl = getEmojiUrl(variation, emojiStyle);
      preloadImage(emojiUrl);
    });
}

export const preloadedEmojs: Set<string> = new Set();

function preloadImage(url: string): void {
  const image = new Image();
  image.src = url;
}
