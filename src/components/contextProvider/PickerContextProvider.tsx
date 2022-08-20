import * as React from 'react';
import { useState } from 'react';
import { DataEmoji, DataEmojis } from '../../dataUtils/DataTypes';

const PickerContext = React.createContext<{
  PickerMainRef: React.RefObject<HTMLElement>;
  filterState: [
    [string, Record<string, DataEmoji>][],
    React.Dispatch<React.SetStateAction<[string, Record<string, DataEmoji>][]>>
  ];
}>({});

type Props = Readonly<{
  children: React.ReactNode;
  PickerMainRef: React.RefObject<HTMLElement>;
}>;

export function PickerContextProvider({ children, PickerMainRef }: Props) {
  const filterState = useState<[string, Record<string, DataEmoji>][]>([]);

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
