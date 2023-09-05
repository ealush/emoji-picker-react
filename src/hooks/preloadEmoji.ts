import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiVariations } from '../dataUtils/emojiSelectors';
import { EmojiStyle } from '../types/exposedTypes';

export function preloadEmoji(
  getEmojiUrl: GetEmojiUrl,
  emoji: undefined | DataEmoji,
  emojiStyle: EmojiStyle
): void {
  if (!emoji) {
    return;
  }

  if (emojiStyle === EmojiStyle.NATIVE) {
    return;
  }

  const unified = emojiUnified(emoji);

  if (preloadedEmojs.has(unified)) {
    return;
  }

  emojiVariations(emoji).forEach((variation) => {
    const emojiUrl = getEmojiUrl(variation, emojiStyle);
    preloadImage(emojiUrl);
  });

  preloadedEmojs.add(unified);
}

export const preloadedEmojs: Set<string> = new Set();

function preloadImage(url: string): void {
  const image = new Image();
  image.src = url;
}
