import * as React from 'react';

const PickerContext = React.createContext<{
  PickerMainRef: React.RefObject<HTMLElement>;
}>({});

type Props = Readonly<{
  children: React.ReactNode;
  PickerMainRef: React.RefObject<HTMLElement>;
}>;

export function PickerContextProvider({ children, PickerMainRef }: Props) {
  return (
    <PickerContext.Provider
      value={{
        PickerMainRef: PickerMainRef
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
