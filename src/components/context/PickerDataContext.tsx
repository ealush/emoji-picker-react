import React from 'react';

import { CustomEmoji } from '../../config/customEmojiConfig';
import { useSuggestedEmojisModeConfig } from '../../config/useConfig';
import defaultEmojiData from '../../data/emojis';

import {
  DataEmoji,
  DataEmojis,
  EmojiProperties,
  EmojiProperties as Keys,
} from '../../dataUtils/DataTypes';
import {
  activeVariationFromUnified,
  unifiedWithoutSkinTone,
} from '../../dataUtils/emojiUtils';
import { getSuggested } from '../../dataUtils/suggested';
import { Categories, EmojiData, SkinTones } from '../../types/exposedTypes';

import { usePickerConfig } from './PickerConfigContext';
import { useUpdateSuggested } from './PickerContext';

export interface PickerDataContextValue {
  emojiData: EmojiData;
  allEmojis: DataEmojis;
  allEmojisByUnified: Record<string, DataEmoji>;
  searchIndex: Record<string, Record<string, DataEmoji>>;
  emojiByUnified: (unified?: string) => DataEmoji | undefined;
  activeVariationFromUnified: (unified: string) => SkinTones | null;
}

const PickerDataContext = React.createContext<PickerDataContextValue>({
  emojiData: {} as EmojiData,
  allEmojis: [],
  allEmojisByUnified: {},
  searchIndex: {},
  emojiByUnified: () => undefined,
  activeVariationFromUnified: () => null,
});

export function PickerDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customEmojis, emojiData: genericEmojiData } = usePickerConfig();

  const data = React.useMemo(() => {
    const emojiData = genericEmojiData || (defaultEmojiData as EmojiData);

    // Clone to avoid mutation of shared source
    const newData: EmojiData = JSON.parse(JSON.stringify(emojiData));

    if (customEmojis && customEmojis.length > 0) {
      newData.emojis[Categories.CUSTOM] =
        customEmojis.map(customToRegularEmoji);
    }

    const emojis = newData.emojis || {};

    const allEmojis: DataEmojis = Object.values(emojis).flat();
    const allEmojisByUnified: Record<string, DataEmoji> = {};
    const searchIndex: Record<string, Record<string, DataEmoji>> = {};

    allEmojis.forEach((emoji) => {
      const unified = emoji[Keys.unified];
      allEmojisByUnified[unified] = emoji;

      if (emoji[Keys.variations]) {
        emoji[Keys.variations]?.forEach((variation) => {
          allEmojisByUnified[variation] = emoji;
        });
      }

      // Index for search
      // Re-implement indexEmoji logic here to be local
      const joinedNameString = (emoji[Keys.name] || [])
        .join('')
        .toLowerCase()
        .split('');

      joinedNameString.forEach((char: string) => {
        searchIndex[char] = searchIndex[char] ?? {};
        searchIndex[char][unified] = emoji;
      });
    });

    return {
      emojiData: newData,
      allEmojis,
      allEmojisByUnified,
      searchIndex,
    };
  }, [genericEmojiData, customEmojis]);

  const emojiByUnified = React.useCallback(
    (unified?: string): DataEmoji | undefined => {
      if (!unified) return undefined;

      const result =
        data.allEmojisByUnified[unified] ??
        data.allEmojisByUnified[unifiedWithoutSkinTone(unified)];
      return result;
    },
    [data.allEmojisByUnified],
  );

  return (
    <PickerDataContext.Provider
      value={{
        ...data,
        emojiByUnified,
        activeVariationFromUnified,
      }}
    >
      {children}
    </PickerDataContext.Provider>
  );
}

export function usePickerDataContext() {
  return React.useContext(PickerDataContext);
}

export function useGetEmojisByCategory() {
  const { emojiData, emojiByUnified } = usePickerDataContext();
  const suggestedEmojisModeConfig = useSuggestedEmojisModeConfig();
  const [suggestedUpdated] = useUpdateSuggested();

  const suggested = React.useMemo(() => {
    const suggested = getSuggested(suggestedEmojisModeConfig) ?? [];

    return suggested
      .map((s) => {
        const emoji = emojiByUnified(s.unified);
        if (!emoji) return undefined;
        return {
          ...emoji,
          [Keys.unified]: s.unified,
        };
      })
      .filter(Boolean) as DataEmojis;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestedUpdated, suggestedEmojisModeConfig, emojiByUnified]);

  return function getEmojisByCategory(category: Categories): DataEmojis {
    if (category === Categories.SUGGESTED) {
      return suggested;
    }

    return emojiData.emojis?.[category] ?? [];
  };
}

function customToRegularEmoji(emoji: CustomEmoji): DataEmoji {
  return {
    [EmojiProperties.name]: emoji.names.map((name: string) =>
      name.toLowerCase(),
    ),
    [EmojiProperties.unified]: emoji.id.toLowerCase(),
    [EmojiProperties.added_in]: '0',
    [EmojiProperties.imgUrl]: emoji.imgUrl,
  };
}
