import * as React from 'react';
import { useState } from 'react';
import { DataEmoji, DataEmojis } from '../../dataUtils/DataTypes';
import { FilterDict } from '../../hooks/useFilter';

const PickerContext = React.createContext<{
  PickerMainRef: React.RefObject<HTMLElement>;
  filterState: [FilterState, React.Dispatch<React.SetStateAction<FilterState>>];
}>({});

type Props = Readonly<{
  children: React.ReactNode;
  PickerMainRef: React.RefObject<HTMLElement>;
}>;

export function PickerContextProvider({ children, PickerMainRef }: Props) {
  const filterState = useState<FilterState>([]);

  return (
    <PickerContext.Provider
      value={{
        PickerMainRef,
        filterState
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

type FilterState = [string, FilterDict][];
