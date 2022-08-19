import * as React from 'react';

const PickerContext = React.createContext({});

type Props = Readonly<{
  children: React.ReactNode;
}>;

export function PickerContextProvider({ children }: Props) {
  return <PickerContext.Provider value={{}}>{children}</PickerContext.Provider>;
}
