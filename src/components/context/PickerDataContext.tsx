import React from 'react';

import {
  useSuggestedEmojisConfig,
  useSuggestedEmojisModeConfig,
} from '../../config/useConfig';
import { getPickerDataSnapshot } from '../../data-core/pickerData';
import {
  DataEmoji,
  DataEmojis,
  EmojiProperties as Keys,
} from '../../dataUtils/DataTypes';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import {
  activeVariationFromUnified,
  unifiedWithoutSkinTone,
} from '../../dataUtils/emojiUtils';
import { getSuggested } from '../../dataUtils/suggested';
import { resolveSuggestedRenderIds } from '../../dataUtils/suggestedEmojis';
import { useDataIdentityStabilityWarning } from '../../hooks/useDataIdentityStabilityWarning';
import { useIsMounted } from '../../hooks/useIsMounted';
import { Categories, EmojiData, SkinTones } from '../../types/exposedTypes';

import { usePickerConfig } from './PickerConfigContext';
import { useUpdateSuggested } from './PickerContext';

export interface PickerDataContextValue {
  emojiData: EmojiData;
  allEmojis: DataEmojis;
  allEmojisByUnified: Record<string, DataEmoji>;
  searchIndex: Record<string, Record<string, DataEmoji>>;
  customGroups: Record<string, DataEmojis>;
  emojiByUnified: (unified?: string) => DataEmoji | undefined;
  activeVariationFromUnified: (unified: string) => SkinTones | null;
}

const PickerDataContext = React.createContext<PickerDataContextValue>({
  emojiData: {} as EmojiData,
  allEmojis: [],
  allEmojisByUnified: Object.create(null),
  searchIndex: Object.create(null),
  customGroups: Object.create(null),
  emojiByUnified,
  activeVariationFromUnified: () => null,
});

export function PickerDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { customEmojis, emojiData: genericEmojiData } = usePickerConfig();

  useDataIdentityStabilityWarning(genericEmojiData, customEmojis);

  // Phase 2 shared derivation: no per-Root JSON clone of the full dataset,
  // caller data never mutated, base index shared by dataset identity, custom
  // derivation cached separately by customEmojis identity. emojiVersion /
  // hiddenEmojis remain per-Root filtering layers elsewhere and never force
  // a base-index rebuild.
  const data = React.useMemo(() => {
    const snapshot = getPickerDataSnapshot(genericEmojiData, customEmojis);

    return {
      emojiData: snapshot.emojiData,
      allEmojis: snapshot.allEmojis,
      allEmojisByUnified: snapshot.allEmojisByUnified,
      searchIndex: snapshot.searchIndex,
      customGroups: snapshot.customGroups,
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
  const { emojiData, emojiByUnified, customGroups } = usePickerDataContext();
  const suggestedEmojisModeConfig = useSuggestedEmojisModeConfig();
  const callerSuggestedEmojis = useSuggestedEmojisConfig();
  const [suggestedUpdated] = useUpdateSuggested();
  // Suggestions come from localStorage, which doesn't exist during SSR.
  // Read them only after mount so the first client render matches the server.
  const isMounted = useIsMounted();

  const suggested = React.useMemo(() => {
    if (!isMounted) {
      return [] as DataEmojis;
    }

    // Caller-defined suggestions fully determine contents/order while the
    // prop is present; persistence mode is ignored and nothing is written
    // to localStorage by this path.
    if (callerSuggestedEmojis !== undefined) {
      return resolveSuggestedRenderIds(callerSuggestedEmojis, (id) =>
        emojiByUnified(id),
      )
        .map((identity) => {
          const emoji = emojiByUnified(identity);
          if (!emoji) return undefined;
          return {
            ...emoji,
            [Keys.unified]: identity,
          };
        })
        .filter(Boolean) as DataEmojis;
    }

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
  }, [
    isMounted,
    suggestedUpdated,
    suggestedEmojisModeConfig,
    callerSuggestedEmojis,
    emojiByUnified,
  ]);

  return function getEmojisByCategory(
    category: Categories,
    group?: string,
  ): DataEmojis {
    if (category === Categories.SUGGESTED) {
      return suggested;
    }

    if (category === Categories.CUSTOM && group) {
      return customGroups[group] ?? [];
    }

    return emojiData.emojis?.[category] ?? [];
  };
}
