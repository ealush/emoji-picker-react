import React from 'react';

import { useUpdateSuggested } from '../components/context/PickerContext';
import { Categories } from '../config/categoryConfig';
import { cdnUrl } from '../config/cdnUrls';
import { CustomEmoji } from '../config/customEmojiConfig';
import { useSuggestedEmojisModeConfig } from '../config/useConfig';
import emojis from '../data/emojis';
import skinToneVariations, {
  skinTonesMapped
} from '../data/skinToneVariations';
import { EmojiStyle, SkinTones } from '../types/exposedTypes';

import { DataEmoji, DataEmojis, EmojiProperties, WithName } from './DataTypes';
import { indexEmoji } from './alphaNumericEmojiIndex';
import { getSuggested } from './suggested';

export function emojiNames(emoji: WithName): string[] {
  return emoji[EmojiProperties.name] ?? [];
}

export function addedIn(emoji: DataEmoji): number {
  return parseFloat(emoji[EmojiProperties.added_in]);
}

export function emojiName(emoji?: WithName): string {
  if (!emoji) {
    return '';
  }

  return emojiNames(emoji)[0];
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

export function useGetEmojisByCategory(): (Category: Categories) => DataEmojis {
  const suggestedEmojisModeConfig = useSuggestedEmojisModeConfig();
  const [suggestedUpdated] = useUpdateSuggested();

  const suggested = React.useMemo(
    () => {
      const suggested = getSuggested(suggestedEmojisModeConfig) ?? [];

      return suggested
        .map(s => emojiByUnified(s.unified))
        .filter(Boolean) as DataEmojis;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suggestedUpdated, suggestedEmojisModeConfig]
  );

  return function getEmojisByCategory(category: Categories): DataEmojis {
    if (category === Categories.SUGGESTED) {
      return suggested;
    }

    // @ts-ignore
    return emojis[category] ?? [];
  };
}

// WARNING: DO NOT USE DIRECTLY
export function emojiUrlByUnified(
  unified: string,
  emojiStyle: EmojiStyle
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
  skinTone?: string
): string | undefined {
  return skinTone
    ? emojiVariations(emoji).find(variation => variation.includes(skinTone))
    : emojiUnified(emoji);
}

export function emojiByUnified(unified?: string): DataEmoji | undefined {
  if (!unified) {
    return;
  }

  if (allEmojisByUnified[unified]) {
    return allEmojisByUnified[unified];
  }

  const withoutSkinTone = unifiedWithoutSkinTone(unified);
  return allEmojisByUnified[withoutSkinTone];
}

export const allEmojis: DataEmojis = Object.values(emojis).flat();

export function setCustomEmojis(customEmojis: CustomEmoji[]): void {
  emojis[Categories.CUSTOM].length = 0;

  customEmojis.forEach(emoji => {
    const emojiData = customToRegularEmoji(emoji);

    emojis[Categories.CUSTOM].push(emojiData as never);

    if (allEmojisByUnified[emojiData[EmojiProperties.unified]]) {
      return;
    }

    allEmojis.push(emojiData);
    allEmojisByUnified[emojiData[EmojiProperties.unified]] = emojiData;
    indexEmoji(emojiData);
  });
}

function customToRegularEmoji(emoji: CustomEmoji): DataEmoji {
  return {
    [EmojiProperties.name]: emoji.names.map(name => name.toLowerCase()),
    [EmojiProperties.unified]: emoji.id.toLowerCase(),
    [EmojiProperties.added_in]: '0',
    [EmojiProperties.imgUrl]: emoji.imgUrl
  };
}

const allEmojisByUnified: {
  [unified: string]: DataEmoji;
} = {};

setTimeout(() => {
  allEmojis.reduce((allEmojis, Emoji) => {
    allEmojis[emojiUnified(Emoji)] = Emoji;

    if (emojiHasVariations(Emoji)) {
      emojiVariations(Emoji).forEach(variation => {
        allEmojis[variation] = Emoji;
      });
    }

    return allEmojis;
  }, allEmojisByUnified);
});

export function activeVariationFromUnified(unified: string): SkinTones | null {
  const [, suspectedSkinTone] = unified.split('-') as [string, SkinTones];
  return skinToneVariations.includes(suspectedSkinTone)
    ? suspectedSkinTone
    : null;
}
