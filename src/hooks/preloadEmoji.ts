import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiVariations } from '../dataUtils/emojiUtils';
import { EmojiStyleValue } from '../types/exposedTypes';

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
  // With `rendered`, only the image the cell renders (the active tone's, or
  // the base) is fetched. It is marked apart from a full preload, so a
  // later full preload (on focus) still fetches every tone; a full one
  // covers it.
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
