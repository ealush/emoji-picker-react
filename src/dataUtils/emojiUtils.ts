import { cdnUrl } from '../config/cdnUrls';
import { skinTonesMapped } from '../data/skinToneVariations';
import { EmojiStyle, SkinTones } from '../types/exposedTypes';

import { DataEmoji, EmojiProperties, WithName } from './DataTypes';

export function emojiNames(emoji: WithName): string[] {
  return emoji[EmojiProperties.name] ?? [];
}

export function addedIn(emoji: DataEmoji): number {
  return parseFloat(emoji[EmojiProperties.added_in] || '0');
}

export function emojiName(emoji?: WithName): string {
  if (!emoji) {
    return '';
  }

  const names = emojiNames(emoji);
  return names[names.length - 1];
}

export function unifiedWithoutSkinTone(unified: string): string {
  const splat = unified.split('-');
  const [skinTone] = splat.splice(1, 1);

  if (skinTonesMapped[skinTone]) {
    return splat.join('-');
  }

  return unified;
}

export function emojiUnified(emoji: DataEmoji, skinTone?: string): string {
  const unified = emoji[EmojiProperties.unified];

  if (!skinTone || !emojiHasVariations(emoji)) {
    return unified;
  }

  return emojiVariationUnified(emoji, skinTone) ?? unified;
}

export function emojiUrlByUnified(
  unified: string,
  emojiStyle: EmojiStyle,
): string {
  return `${cdnUrl(emojiStyle)}${unified}.png`;
}

export function emojiVariations(emoji: DataEmoji): string[] {
  return emoji[EmojiProperties.variations] ?? [];
}

export function emojiHasVariations(emoji: DataEmoji): boolean {
  return emojiVariations(emoji).length > 0;
}

export function emojiVariationUnified(
  emoji: DataEmoji,
  skinTone?: string,
): string | undefined {
  return skinTone
    ? emojiVariations(emoji).find((variation) => variation.includes(skinTone))
    : emojiUnified(emoji);
}

export function activeVariationFromUnified(unified: string): SkinTones | null {
  const [, suspectedSkinTone] = unified.split('-') as [string, SkinTones];
  return Object.keys(skinTonesMapped).includes(suspectedSkinTone)
    ? suspectedSkinTone
    : null;
}
