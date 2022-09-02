import * as React from 'react';
import { useState } from 'react';
import { useDefaultSkinToneConfig } from '../../config/useConfig';
import { alphaNumericEmojiIndex } from '../../dataUtils/alphaNumericEmojiIndex';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { scrollCategoryIntoView } from '../../DomUtils/scrollCategoryIntoView';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';
import { SkinTones } from '../../types/exposedTypes';
import { usePickerMainRef } from './ElementRefContext';

export function PickerContextProvider({ children }: Props) {
  const defaultSkinTone = useDefaultSkinToneConfig();

  // Initialize the filter with the inititial dictionary
  const filterRef = React.useRef<FilterState>(alphaNumericEmojiIndex);
  const disallowClickRef = React.useRef<boolean>(false);

  const searchTerm = useDebouncedState('', 100);
  const skinToneFanOpenState = useState<boolean>(false);
  const activeSkinTone = useState<SkinTones>(defaultSkinTone);
  const activeCategoryState = useState<ActiveCategoryState>(null);
  const emojisThatFailedToLoadState = useState<Set<string>>(new Set());
  const emojiVariationPickerState = useState<DataEmoji | null>(null);
  const [isPastInitialLoad, setIsPastInitialLoad] = useState(false);

  useMarkInitialLoad(setIsPastInitialLoad);

  return (
    <PickerContext.Provider
      value={{
        filterRef,
        searchTerm,
        activeCategoryState,
        activeSkinTone,
        emojisThatFailedToLoadState,
        isPastInitialLoad,
        emojiVariationPickerState,
        skinToneFanOpenState,
        disallowClickRef
      }}
    >
      {children}
    </PickerContext.Provider>
  );
}

type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

const PickerContext = React.createContext<{
  searchTerm: [string, (term: string) => void];
  activeCategoryState: ReactState<ActiveCategoryState>;
  activeSkinTone: ReactState<SkinTones>;
  emojisThatFailedToLoadState: ReactState<Set<string>>;
  isPastInitialLoad: boolean;
  emojiVariationPickerState: ReactState<DataEmoji | null>;
  skinToneFanOpenState: ReactState<boolean>;
  filterRef: React.MutableRefObject<FilterState>;
  disallowClickRef: React.MutableRefObject<boolean>;
}>({
  searchTerm: ['', () => {}],
  activeCategoryState: [null, () => {}],
  activeSkinTone: [SkinTones.NEUTRAL, () => {}],
  emojisThatFailedToLoadState: [new Set(), () => {}],
  isPastInitialLoad: true,
  emojiVariationPickerState: [null, () => {}],
  skinToneFanOpenState: [false, () => {}],
  filterRef: { current: {} },
  disallowClickRef: { current: false }
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

export function useSearchTermState() {
  const { searchTerm } = React.useContext(PickerContext);
  return searchTerm;
}

export function useActiveCategoryState(): [
  ActiveCategoryState,
  (nextActive: string) => void,
  (nextActive: string) => void
] {
  const { activeCategoryState } = React.useContext(PickerContext);
  const PickerMainRef = usePickerMainRef();

  const [activeCategory, setActiveCategory] = activeCategoryState;
  return [activeCategory, setCategory, setActiveCategoryAndScroll];

  function setCategory(category: string) {
    setActiveCategory(category);
  }

  function setActiveCategoryAndScroll(category: string) {
    setCategory(category);
    scrollCategoryIntoView(PickerMainRef.current, category);
  }
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

export type FilterState = Record<string, FilterDict>;

type ActiveCategoryState = null | string;
