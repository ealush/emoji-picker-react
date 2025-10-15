import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiVariations } from '../dataUtils/emojiSelectors';
import { EmojiStyle } from '../types/exposedTypes';
import { Dimensions } from '../virtualization/virtualizationHelpers';

// eslint-disable-next-line max-params
export function preloadEmojiIfNeeded(
  emoji: undefined | DataEmoji,
  emojiStyles: EmojiStyle,
  scrollTop: number,
  clientHeight: number,
  topOffset: number,
  style: { top: number } | undefined,
  dimensions: Dimensions,
  getEmojiUrl: GetEmojiUrl
): void {
  if (!emoji) {
    return;
  }

  if (emojiStyles === EmojiStyle.NATIVE) {
    return;
  }

  const unified = emojiUnified(emoji);

  if (preloadedEmojs.has(unified)) {
    return;
  }

  // preload only if the emoji is a few rows below the viewport
  if (!style || !dimensions) {
    return;
  }

  setTimeout(() => {
    const emojiTop = topOffset + style.top;
    const viewportBottom = scrollTop + clientHeight;

    const isJustBelowViewport =
      emojiTop >= viewportBottom &&
      emojiTop < viewportBottom + dimensions.emojiSize * 2;

    if (isJustBelowViewport) {
      preloadEmoji(getEmojiUrl, emoji, emojiStyles);
    }
  });
}

export function preloadEmoji(
  getEmojiUrl: GetEmojiUrl,
  emoji: undefined | DataEmoji,
  emojiStyle: EmojiStyle
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
    .forEach(variation => {
      const emojiUrl = getEmojiUrl(variation, emojiStyle);
      preloadImage(emojiUrl);
    });
}

export const preloadedEmojs: Set<string> = new Set();

function preloadImage(url: string): void {
  const image = new Image();
  image.src = url;
}
