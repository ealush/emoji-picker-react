import * as React from 'react';
import { useState } from 'react';
import { SkinTones } from '../../data/skinToneVariations';
import categories from '../../dataUtils/categories';
import { scrollCategoryIntoView } from '../../DomUtils/scrollCategoryIntoView';
import { FilterDict } from '../../hooks/useFilter';
import { useMarkInitialLoad } from '../../hooks/useInitialLoad';

const PickerContext = React.createContext<{
  PickerMainRef: React.RefObject<HTMLElement>;
  filterState: [FilterState, React.Dispatch<React.SetStateAction<FilterState>>];
  searchTerm: [string, React.Dispatch<React.SetStateAction<string>>];
  activeCategoryState: [
    ActiveCategoryState,
    React.Dispatch<React.SetStateAction<ActiveCategoryState>>
  ];
  activeSkinTone: [SkinTones, React.Dispatch<React.SetStateAction<SkinTones>>];
  emojisThatFailedToLoad: React.MutableRefObject<Set<string>>;
  isPastInitialLoad: boolean;
}>({
  PickerMainRef: React.createRef(),
  filterState: [{}, () => {}],
  searchTerm: ['', () => {}],
  activeCategoryState: [null, () => {}],
  activeSkinTone: [SkinTones.NEUTRAL, () => {}],
  emojisThatFailedToLoad: { current: new Set() },
  isPastInitialLoad: true
});

type Props = Readonly<{
  children: React.ReactNode;
  PickerMainRef: React.RefObject<HTMLElement>;
}>;

export function PickerContextProvider({ children, PickerMainRef }: Props) {
  const filterState = useState<FilterState>(null);
  const searchTerm = useState<string>('');
  const activeSkinTone = useState<SkinTones>(SkinTones.NEUTRAL);
  const activeCategoryState = useState<ActiveCategoryState>(categories[0]);
  const emojisThatFailedToLoad = React.useRef<Set<string>>(new Set());
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
        emojisThatFailedToLoad,
        isPastInitialLoad
      }}
    >
      {children}
    </PickerContext.Provider>
  );
}

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

export function useEmojisThatFailedToLoad(): {
  markAsFailedToLoad: (unified: string) => void;
  didFailToLoad: (unified: string) => boolean;
} {
  const { emojisThatFailedToLoad } = React.useContext(PickerContext);

  function markAsFailedToLoad(unified: string) {
    emojisThatFailedToLoad.current.add(unified);
  }

  function didFailToLoad(unified: string): boolean {
    return emojisThatFailedToLoad.current.has(unified);
  }
  return {
    markAsFailedToLoad,
    didFailToLoad
  };
}

export function useIsPastInitialLoad(): boolean {
  const { isPastInitialLoad } = React.useContext(PickerContext);
  return isPastInitialLoad;
}

export type FilterState = null | Record<string, FilterDict>;

type ActiveCategoryState = null | string;
