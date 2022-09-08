import * as React from 'react';

export function ElementRefContextProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const PickerMainRef = React.useRef<HTMLElement>(null);
  const AnchoredEmojiRef = React.useRef<HTMLElement>(null);
  const BodyRef = React.useRef<HTMLElement>(null);
  const SearchInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <ElementRefContext.Provider
      value={{ PickerMainRef, AnchoredEmojiRef, BodyRef, SearchInputRef }}
    >
      {children}
    </ElementRefContext.Provider>
  );
}

export type ElementRef<
  E extends HTMLElement = HTMLElement
> = React.MutableRefObject<E | null>;

type ElementRefs = {
  PickerMainRef: ElementRef;
  AnchoredEmojiRef: ElementRef;
  SearchInputRef: ElementRef<HTMLInputElement>;
  BodyRef: React.MutableRefObject<HTMLElement | null>;
};

const ElementRefContext = React.createContext<ElementRefs>({
  PickerMainRef: React.createRef(),
  AnchoredEmojiRef: React.createRef(),
  BodyRef: React.createRef(),
  SearchInputRef: React.createRef()
});

function useElementRef() {
  return React.useContext(ElementRefContext);
}

export function usePickerMainRef() {
  return useElementRef()['PickerMainRef'];
}

export function useAnchoredEmojiRef() {
  return useElementRef()['AnchoredEmojiRef'];
}

export function useSetAnchoredEmojiRef(): (target: null | HTMLElement) => void {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  return (target: null | HTMLElement) => {
    AnchoredEmojiRef.current = target;
  };
}

export function useBodyRef(): React.MutableRefObject<HTMLDivElement | null> {
  return useElementRef()[
    'BodyRef'
  ] as React.MutableRefObject<HTMLDivElement | null>;
}

export function useSearchInputRef() {
  return useElementRef()['SearchInputRef'];
}
