import * as React from 'react';
import { useState } from 'react';
import categories from '../../dataUtils/categories';
import { DataGroups } from '../../dataUtils/DataTypes';
import { FilterDict } from '../../hooks/useFilter';

const PickerContext = React.createContext<{
  PickerMainRef: React.RefObject<HTMLElement>;
  filterState: [FilterState, React.Dispatch<React.SetStateAction<FilterState>>];
  searchTerm: [string, React.Dispatch<React.SetStateAction<string>>];
  activeCategoryState: [
    null | DataGroups,
    React.Dispatch<React.SetStateAction<null | DataGroups>>
  ];
}>({
  PickerMainRef: React.createRef(),
  filterState: [{}, () => {}],
  searchTerm: ['', () => {}],
  activeCategoryState: [null, () => {}]
});

type Props = Readonly<{
  children: React.ReactNode;
  PickerMainRef: React.RefObject<HTMLElement>;
}>;

export function PickerContextProvider({ children, PickerMainRef }: Props) {
  const filterState = useState<FilterState>(null);
  const searchTerm = useState<string>('');
  const activeCategoryState = useState<DataGroups | null>(categories[0]);

  return (
    <PickerContext.Provider
      value={{
        PickerMainRef,
        filterState,
        searchTerm,
        activeCategoryState
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

export function useActiveCategoryState() {
  const { activeCategoryState } = React.useContext(PickerContext);
  return activeCategoryState;
}

type FilterState = null | Record<string, FilterDict>;
