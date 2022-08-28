import * as React from 'react';

export function ElementRefContextProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const PickerMainRef = React.useRef<HTMLElement>(null);

  return (
    <ElementRefContext.Provider value={{ PickerMainRef }}>
      {children}
    </ElementRefContext.Provider>
  );
}

type ElementRef = React.MutableRefObject<HTMLElement | null>;

type ElementRefs = {
  PickerMainRef: ElementRef;
};

const ElementRefContext = React.createContext<ElementRefs>({
  PickerMainRef: React.createRef()
});

type ElementRefKeys = keyof ElementRefs;

export function useElementRef(key: ElementRefKeys) {
  const { [key]: elementRef } = React.useContext(ElementRefContext);
  return elementRef;
}

export function usePickerMainRef() {
  return useElementRef('PickerMainRef');
}
