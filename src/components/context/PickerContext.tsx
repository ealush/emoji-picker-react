import * as React from 'react';
import { useState } from 'react';

import {
  useDefaultSkinToneConfig,
  useFilterStringConfig,
  useReactionsOpenConfig
} from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { alphaNumericEmojiIndex } from '../../dataUtils/alphaNumericEmojiIndex';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { useDisallowedEmojis } from '../../hooks/useDisallowedEmojis';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';
import { SkinTones } from '../../types/exposedTypes';

export function filterEmojisByKeywordWithLongestMatch(keyword: string) {
  const normalizedFilter = keyword.trim().toLowerCase();

  // Find the longest matching filter to use as a base
  const longestMatch = findLongestMatchingFilter(normalizedFilter, alphaNumericEmojiIndex);

  if (longestMatch) {
    // Filter the emojis from the longest match
    return filterEmojisByKeyword(longestMatch, normalizedFilter);
  } else {
    // Filter from the full emoji index
    return filterEmojisByKeyword(alphaNumericEmojiIndex.current, normalizedFilter);
  }
}

export function PickerContextProvider({ children }: Props) {
  const disallowedEmojis = useDisallowedEmojis();
  const defaultSkinTone = useDefaultSkinToneConfig();
  const reactionsDefaultOpen = useReactionsOpenConfig();
  const filterString = useFilterStringConfig();

  // Initialize the filter with the inititial dictionary
  const filterRef = React.useRef<FilterState>(alphaNumericEmojiIndex);
  const disallowClickRef = React.useRef<boolean>(false);
  const disallowMouseRef = React.useRef<boolean>(false);
  const disallowedEmojisRef = React.useRef<Record<string, boolean>>(
    disallowedEmojis
  );

  const suggestedUpdateState = useDebouncedState(Date.now(), 200);
  const searchTerm = useDebouncedState('', 100);
  const skinToneFanOpenState = useState<boolean>(false);
  const activeSkinTone = useState<SkinTones>(defaultSkinTone);
  const activeCategoryState = useState<ActiveCategoryState>(null);
  const emojisThatFailedToLoadState = useState<Set<string>>(new Set());
  const emojiVariationPickerState = useState<DataEmoji | null>(null);
  const reactionsModeState = useState(reactionsDefaultOpen);
  const [isPastInitialLoad, setIsPastInitialLoad] = useState(false);
  const visibleCategoriesState = useState<string[]>([]);

  useMarkInitialLoad(setIsPastInitialLoad);

  // Sync filterString prop with internal searchTerm state
  const [, setSearchTerm] = searchTerm;
  React.useEffect(() => {
    const normalizedFilter = filterString.trim().toLowerCase();

    // Build filter dictionary for the search term if it doesn't exist
    if (normalizedFilter && !filterRef.current[normalizedFilter]) {
      // Find the longest matching filter to use as a base
      const longestMatch = findLongestMatchingFilter(normalizedFilter, filterRef.current);

      if (longestMatch) {
        // Filter the emojis from the longest match
        filterRef.current[normalizedFilter] = filterEmojisByKeyword(longestMatch, normalizedFilter);
      } else {
        // Filter from the full emoji index
        filterRef.current[normalizedFilter] = filterEmojisByKeyword(alphaNumericEmojiIndex.current, normalizedFilter);
      }
    }

    setSearchTerm(normalizedFilter);
  }, [filterString, setSearchTerm]);

  return (
    <PickerContext.Provider
      value={{
        activeCategoryState,
        activeSkinTone,
        disallowClickRef,
        disallowMouseRef,
        disallowedEmojisRef,
        emojiVariationPickerState,
        emojisThatFailedToLoadState,
        filterRef,
        isPastInitialLoad,
        searchTerm,
        skinToneFanOpenState,
        suggestedUpdateState,
        reactionsModeState,
        visibleCategoriesState
      }}
    >
      {children}
    </PickerContext.Provider>
  );
}

type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

const PickerContext = React.createContext<{
  searchTerm: [string, (term: string) => Promise<string>];
  suggestedUpdateState: [number, (term: number) => void];
  activeCategoryState: ReactState<ActiveCategoryState>;
  activeSkinTone: ReactState<SkinTones>;
  emojisThatFailedToLoadState: ReactState<Set<string>>;
  isPastInitialLoad: boolean;
  emojiVariationPickerState: ReactState<DataEmoji | null>;
  skinToneFanOpenState: ReactState<boolean>;
  filterRef: React.MutableRefObject<FilterState>;
  disallowClickRef: React.MutableRefObject<boolean>;
  disallowMouseRef: React.MutableRefObject<boolean>;
  disallowedEmojisRef: React.MutableRefObject<Record<string, boolean>>;
  reactionsModeState: ReactState<boolean>;
  visibleCategoriesState: ReactState<Array<string>>;
}>({
  activeCategoryState: [null, () => {}],
  activeSkinTone: [SkinTones.NEUTRAL, () => {}],
  disallowClickRef: { current: false },
  disallowMouseRef: { current: false },
  disallowedEmojisRef: { current: {} },
  emojiVariationPickerState: [null, () => {}],
  emojisThatFailedToLoadState: [new Set(), () => {}],
  filterRef: { current: {} },
  isPastInitialLoad: true,
  searchTerm: ['', () => new Promise<string>(() => undefined)],
  skinToneFanOpenState: [false, () => {}],
  suggestedUpdateState: [Date.now(), () => {}],
  reactionsModeState: [false, () => {}],
  visibleCategoriesState: [[], () => []]
});

type Props = Readonly<{
  children: React.ReactNode;
}>;

export function useFilterRef() {
  const { filterRef } = React.useContext(PickerContext);
  return filterRef;
}

export function useDisallowClickRef() {
  const { disallowClickRef } = React.useContext(PickerContext);
  return disallowClickRef;
}

export function useDisallowMouseRef() {
  const { disallowMouseRef } = React.useContext(PickerContext);
  return disallowMouseRef;
}

export function useReactionsModeState() {
  const { reactionsModeState } = React.useContext(PickerContext);
  return reactionsModeState;
}

export function useSearchTermState() {
  const { searchTerm } = React.useContext(PickerContext);
  return searchTerm;
}

export function useActiveSkinToneState(): [
  SkinTones,
  (skinTone: SkinTones) => void
] {
  const { activeSkinTone } = React.useContext(PickerContext);
  return activeSkinTone;
}

export function useEmojisThatFailedToLoadState() {
  const { emojisThatFailedToLoadState } = React.useContext(PickerContext);
  return emojisThatFailedToLoadState;
}

export function useIsPastInitialLoad(): boolean {
  const { isPastInitialLoad } = React.useContext(PickerContext);
  return isPastInitialLoad;
}

export function useEmojiVariationPickerState() {
  const { emojiVariationPickerState } = React.useContext(PickerContext);
  return emojiVariationPickerState;
}

export function useSkinToneFanOpenState() {
  const { skinToneFanOpenState } = React.useContext(PickerContext);
  return skinToneFanOpenState;
}

export function useDisallowedEmojisRef() {
  const { disallowedEmojisRef } = React.useContext(PickerContext);
  return disallowedEmojisRef;
}

export function useVisibleCategoriesState() {
  const { visibleCategoriesState } = React.useContext(PickerContext);
  return visibleCategoriesState;
}

export function useUpdateSuggested(): [number, () => void] {
  const { suggestedUpdateState } = React.useContext(PickerContext);

  const [suggestedUpdated, setsuggestedUpdate] = suggestedUpdateState;
  return [
    suggestedUpdated,
    function updateSuggested() {
      setsuggestedUpdate(Date.now());
    }
  ];
}

export type FilterState = Record<string, FilterDict>;

type ActiveCategoryState = null | string;

// Helper functions for filtering emojis
function filterEmojisByKeyword(
  emojis: FilterDict,
  keyword: string
): FilterDict {
  const filtered: FilterDict = {};

  for (const unified in emojis) {
    const emoji = emojis[unified];

    if (emojiMatchesKeyword(emoji, keyword)) {
      filtered[unified] = emoji;
    }
  }

  return filtered;
}

function emojiMatchesKeyword(emoji: DataEmoji, keyword: string): boolean {
  const names = emoji['n'] ?? []; // EmojiProperties.name is index 1
  return names.some((name: string) => name.includes(keyword));
}

function findLongestMatchingFilter(
  keyword: string,
  filterDict: Record<string, FilterDict>
): FilterDict | null {
  if (filterDict[keyword]) {
    return filterDict[keyword];
  }

  const longestMatchingKey = Object.keys(filterDict)
    .sort((a, b) => b.length - a.length)
    .find(key => keyword.includes(key));

  if (longestMatchingKey) {
    return filterDict[longestMatchingKey];
  }

  return null;
}
