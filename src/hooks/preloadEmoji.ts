import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiVariations } from '../dataUtils/emojiUtils';
import { EmojiStyle, EmojiStyleValue } from '../types/exposedTypes';
import { Dimensions } from '../virtualization/virtualizationHelpers';

// eslint-disable-next-line max-params
export function preloadEmojiIfNeeded(
  emoji: undefined | DataEmoji,
  emojiStyles: EmojiStyleValue,
  scrollTop: number,
  clientHeight: number,
  topOffset: number,
  style: { top: number } | undefined,
  dimensions: Dimensions,
  getEmojiUrl: GetEmojiUrl,
  variations: boolean,
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
      preloadEmoji(getEmojiUrl, emoji, emojiStyles, variations);
    }
  });
}

export function preloadEmoji(
  getEmojiUrl: GetEmojiUrl,
  emoji: undefined | DataEmoji,
  emojiStyle: EmojiStyleValue,
  variations = true,
): void {
  if (!emoji) {
    return;
  }

  const unified = emojiUnified(emoji);

  if (preloadedEmojs.has(unified)) {
    return;
  }
  preloadedEmojs.add(unified);

  // Skin-tone images only when the variation menu can open.
  (variations ? emojiVariations(emoji) : [])
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
