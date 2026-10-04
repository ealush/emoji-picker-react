import React from 'react';

import {
  useSuggestedEmojisConfig,
  useSuggestedEmojisModeConfig,
} from '../../config/useConfig';
import { getPickerDataSnapshot } from '../../data-core/pickerData';
import { normalizeQuery } from '../../data-core/prepare';
import { searchEmojis } from '../../data-core/search';
import {
  DataEmoji,
  DataEmojis,
  EmojiProperties as Keys,
} from '../../dataUtils/DataTypes';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import {
  activeVariationFromUnified,
  emojiNames,
  unifiedWithoutSkinTone,
} from '../../dataUtils/emojiUtils';
import { getSuggested } from '../../dataUtils/suggested';
import { resolveSuggestedRenderIds } from '../../dataUtils/suggestedEmojis';
import { useDataIdentityStabilityWarning } from '../../hooks/useDataIdentityStabilityWarning';
import type { FilterDict } from '../../hooks/useFilter';
import { useIsMounted } from '../../hooks/useIsMounted';
import { Categories, EmojiData, SkinTones } from '../../types/exposedTypes';

import { usePickerConfig } from './PickerConfigContext';
import { useUpdateSuggested } from './PickerContext';

export interface PickerDataContextValue {
  emojiData: EmojiData;
  allEmojis: DataEmojis;
  allEmojisByUnified: Record<string, DataEmoji>;
  customGroups: Record<string, DataEmojis>;
  emojiByUnified: (unified?: string) => DataEmoji | undefined;
  activeVariationFromUnified: (unified: string) => SkinTones | null;
  /**
   * Query-to-filter-dict through the single shared prepared core: core
   * dataset matches mapped back to source records, unioned with the
   * Root-local custom emojis the core never sees.
   */
  queryFilterDict: (query: string) => FilterDict;
}

const PickerDataContext =
  /* @__PURE__ */ React.createContext<PickerDataContextValue>({
    emojiData: {} as EmojiData,
    allEmojis: [],
    allEmojisByUnified: Object.create(null),
    customGroups: Object.create(null),
    emojiByUnified,
    activeVariationFromUnified: () => null,
    queryFilterDict: () => ({}),
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

  const allCustomEmojis = React.useMemo(
    () => [
      ...(data.emojiData.emojis?.[Categories.CUSTOM] ?? []),
      ...Object.values(data.customGroups).flat(),
    ],
    [data.emojiData, data.customGroups],
  );

  const queryFilterDict = React.useCallback(
    (query: string): FilterDict => {
      const normalized = normalizeQuery(query);
      const dict: FilterDict = {};
      if (!normalized) {
        return dict;
      }
      for (const info of searchEmojis(normalized, {
        emojiData: genericEmojiData,
      })) {
        const emoji = data.allEmojisByUnified[info.unified];
        if (emoji) {
          dict[info.unified] = emoji;
        }
      }
      for (const custom of allCustomEmojis) {
        if (emojiNames(custom).some((name) => name.includes(normalized))) {
          dict[custom[Keys.unified]] = custom;
        }
      }
      return dict;
    },
    [genericEmojiData, data.allEmojisByUnified, allCustomEmojis],
  );

  // Stable value identity: provider rerenders must not rerender data
  // consumers while the dataset itself is unchanged.
  const value = React.useMemo(
    () => ({
      ...data,
      emojiByUnified,
      activeVariationFromUnified,
      queryFilterDict,
    }),
    [data, emojiByUnified, queryFilterDict],
  );

  return (
    <PickerDataContext.Provider value={value}>
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
