import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiVariations } from '../dataUtils/emojiUtils';
import { EmojiStyle, EmojiStyleValue } from '../types/exposedTypes';
import {
  Dimensions,
  isJustBelowViewport,
} from '../virtualization/virtualizationHelpers';

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
  rendered: string | undefined,
): void {
  if (!emoji) {
    return;
  }

  if (emojiStyles === EmojiStyle.NATIVE) {
    return;
  }

  const unified = emojiUnified(emoji);

  const key = rendered ? rendered + '/only' : unified;
  if (preloadedEmojs.has(unified) || preloadedEmojs.has(key)) {
    return;
  }

  // preload only if the emoji is a few rows below the viewport
  if (!style || !dimensions) {
    return;
  }

  const emojiTop = topOffset + style.top;
  const viewportBottom = scrollTop + clientHeight;

  if (isJustBelowViewport(emojiTop, viewportBottom, dimensions.emojiSize)) {
    preloadEmoji(getEmojiUrl, emoji, emojiStyles, rendered);
  }
}

export function preloadEmoji(
  getEmojiUrl: GetEmojiUrl,
  emoji: undefined | DataEmoji,
  emojiStyle: EmojiStyleValue,
  rendered?: string,
): void {
  if (!emoji) {
    return;
  }

  const unified = emojiUnified(emoji);
  // Without the variation menu, only the image the cell renders (the
  // active tone's, or the base) is fetched. It is marked apart from a full
  // preload, so a picker with variations on still fetches every tone; a
  // full one covers it.
  const key = rendered ? rendered + '/only' : unified;

  if (preloadedEmojs.has(unified) || preloadedEmojs.has(key)) {
    return;
  }
  preloadedEmojs.add(key);

  (rendered ? [rendered] : emojiVariations(emoji).concat(unified)).forEach(
    (variation) => {
      const emojiUrl = getEmojiUrl(variation, emojiStyle);
      preloadImage(emojiUrl);
    },
  );
}

export const preloadedEmojs: Set<string> = new Set();

function preloadImage(url: string): void {
  const image = new Image();
  image.src = url;
}
