import * as React from 'react';
import { useState } from 'react';
import { SkinTones } from '../../data/skinToneVariations';
import categories from '../../dataUtils/categories';
import { scrollCategoryIntoView } from '../../DomUtils/scrollCategoryIntoView';
import { FilterDict } from '../../hooks/useFilter';

const PickerContext = React.createContext<{
  PickerMainRef: React.RefObject<HTMLElement>;
  filterState: [FilterState, React.Dispatch<React.SetStateAction<FilterState>>];
  searchTerm: [string, React.Dispatch<React.SetStateAction<string>>];
  activeCategoryState: [
    ActiveCategoryState,
    React.Dispatch<React.SetStateAction<ActiveCategoryState>>
  ];
  activeSkinTone: [SkinTones, React.Dispatch<React.SetStateAction<SkinTones>>];
}>({
  PickerMainRef: React.createRef(),
  filterState: [{}, () => {}],
  searchTerm: ['', () => {}],
  activeCategoryState: [null, () => {}],
  activeSkinTone: [SkinTones.NEUTRAL, () => {}]
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

  return (
    <PickerContext.Provider
      value={{
        PickerMainRef,
        filterState,
        searchTerm,
        activeCategoryState,
        activeSkinTone
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

type FilterState = null | Record<string, FilterDict>;

type ActiveCategoryState = null | string;
