import * as React from 'react';
import { useState } from 'react';
import { SkinTones } from '../../data/skinToneVariations';
import categories from '../../dataUtils/categories';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { scrollCategoryIntoView } from '../../DomUtils/scrollCategoryIntoView';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';
import { useDefaultSkinToneConfig } from './PickerConfigContext';

export function PickerContextProvider({ children, PickerMainRef }: Props) {
  const defaultSkinTone = useDefaultSkinToneConfig();

  const filterState = useState<FilterState>(null);
  const searchTerm = useState<string>('');
  const activeSkinTone = useState<SkinTones>(defaultSkinTone);
  const activeCategoryState = useState<ActiveCategoryState>(categories[0]);
  const emojisThatFailedToLoadState = useState<Set<string>>(new Set());
  const emojiVariationPickerState = useState<DataEmoji | null>(null);
  const [isPastInitialLoad, setIsPastInitialLoad] = useState(false);

  useMarkInitialLoad(setIsPastInitialLoad);

  return (
    <PickerContext.Provider
      value={{
        PickerMainRef,
        filterState,
        searchTerm,
        activeCategoryState,
        activeSkinTone,
        emojisThatFailedToLoadState,
        isPastInitialLoad,
        emojiVariationPickerState
      }}
    >
      {children}
    </PickerContext.Provider>
  );
}

type ReactState<T> = [T, React.Dispatch<React.SetStateAction<T>>];

const PickerContext = React.createContext<{
  PickerMainRef: React.RefObject<HTMLElement>;
  filterState: ReactState<FilterState>;
  searchTerm: ReactState<string>;
  activeCategoryState: ReactState<ActiveCategoryState>;
  activeSkinTone: ReactState<SkinTones>;
  emojisThatFailedToLoadState: ReactState<Set<string>>;
  isPastInitialLoad: boolean;
  emojiVariationPickerState: ReactState<DataEmoji | null>;
}>({
  PickerMainRef: React.createRef(),
  filterState: [{}, () => {}],
  searchTerm: ['', () => {}],
  activeCategoryState: [null, () => {}],
  activeSkinTone: [SkinTones.NEUTRAL, () => {}],
  emojisThatFailedToLoadState: [new Set(), () => {}],
  isPastInitialLoad: true,
  emojiVariationPickerState: [null, () => {}]
});

type Props = Readonly<{
  children: React.ReactNode;
  PickerMainRef: React.RefObject<HTMLElement>;
}>;

export function usePickerMainRef() {
  const { PickerMainRef } = React.useContext(PickerContext);
  return PickerMainRef;
}

export function useFilterState() {
  const { filterState } = React.useContext(PickerContext);
  return filterState;
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
  const { activeCategoryState, PickerMainRef } = React.useContext(
    PickerContext
  );

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

export type FilterState = null | Record<string, FilterDict>;

type ActiveCategoryState = null | string;
