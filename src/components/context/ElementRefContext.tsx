import * as React from 'react';

export function ElementRefContextProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const PickerMainRef = React.useRef<HTMLElement>(null);
  const AnchoredEmojiRef = React.useRef<HTMLElement>(null);
  const BodyRef = React.useRef<HTMLElement>(null);

  return (
    <ElementRefContext.Provider
      value={{ PickerMainRef, AnchoredEmojiRef, BodyRef }}
    >
      {children}
    </ElementRefContext.Provider>
  );
}

export type ElementRef = React.MutableRefObject<HTMLElement | null>;

type ElementRefs = {
  PickerMainRef: ElementRef;
  AnchoredEmojiRef: ElementRef;
  BodyRef: React.MutableRefObject<HTMLElement | null>;
};

const ElementRefContext = React.createContext<ElementRefs>({
  PickerMainRef: React.createRef(),
  AnchoredEmojiRef: React.createRef(),
  BodyRef: React.createRef()
});

type ElementRefKeys = keyof ElementRefs;

export function useElementRef(key: ElementRefKeys) {
  const { [key]: elementRef } = React.useContext(ElementRefContext);
  return elementRef;
}

export function usePickerMainRef() {
  return useElementRef('PickerMainRef');
}

export function useAnchoredEmojiRef() {
  return useElementRef('AnchoredEmojiRef');
}

export function useSetAnchoredEmojiRef(): (target: null | HTMLElement) => void {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  return (target: null | HTMLElement) => {
    AnchoredEmojiRef.current = target;
  };
}

export function useBodyRef(): React.MutableRefObject<HTMLDivElement | null> {
  return useElementRef(
    'BodyRef'
  ) as React.MutableRefObject<HTMLDivElement | null>;
}
