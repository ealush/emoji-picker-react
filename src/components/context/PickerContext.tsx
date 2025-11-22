import * as React from 'react';
import { useState } from 'react';

import {
  useDefaultSkinToneConfig,
  useReactionsOpenConfig
} from '../../config/useConfig';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { alphaNumericEmojiIndex } from '../../dataUtils/alphaNumericEmojiIndex';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { useDisallowedEmojis } from '../../hooks/useDisallowedEmojis';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';
import { SkinTones } from '../../types/exposedTypes';

export function PickerContextProvider({ children }: Props) {
  const disallowedEmojis = useDisallowedEmojis();
  const defaultSkinTone = useDefaultSkinToneConfig();
  const reactionsDefaultOpen = useReactionsOpenConfig();

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
  const emojiSizeState = useState<number | null>(null);

  useMarkInitialLoad(setIsPastInitialLoad);

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
        visibleCategoriesState,
        emojiSizeState
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
  emojiSizeState: ReactState<number | null>;
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
  visibleCategoriesState: [[], () => []],
  emojiSizeState: [null, () => {}]
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

export function useEmojiSizeState() {
  const { emojiSizeState } = React.useContext(PickerContext);
  return emojiSizeState;
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
