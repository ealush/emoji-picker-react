import { DataEmoji } from '../dataUtils/DataTypes';
import {
  emojiUnified,
  emojiUrlByUnified,
  emojiVariations
} from '../dataUtils/emojiSelectors';
import { EmojiStyle } from '../types/exposedTypes';

export function preloadEmoji(emoji: DataEmoji, emojiStyle: EmojiStyle): void {
  if (emojiStyle === EmojiStyle.NATIVE) {
    return;
  }

  const unified = emojiUnified(emoji);

  if (preloadedEmojs.has(unified)) {
    return;
  }

  emojiVariations(emoji).forEach(variation => {
    const emojiUrl = emojiUrlByUnified(emojiStyle, variation);
    preloadImage(emojiUrl);
  });

  preloadedEmojs.add(unified);
}

export const preloadedEmojs: Set<string> = new Set();

function preloadImage(url: string): void {
  const image = new Image();
  image.src = url;
}
