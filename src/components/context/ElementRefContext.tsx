import * as React from 'react';

import { focusElement } from '../../DomUtils/focusElement';
import { NullableElement } from '../../DomUtils/selectors';

export function ElementRefContextProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const PickerMainRef = React.useRef<HTMLElement>(null);
  const AnchoredEmojiRef = React.useRef<HTMLElement>(null);
  const BodyRef = React.useRef<HTMLDivElement>(null);
  const EmojiListRef = React.useRef<HTMLUListElement>(null);
  const SearchInputRef = React.useRef<HTMLInputElement>(null);
  const SkinTonePickerRef = React.useRef<HTMLDivElement>(null);
  const CategoryNavigationRef = React.useRef<HTMLDivElement>(null);
  const VariationPickerRef = React.useRef<HTMLDivElement>(null);
  const ReactionsRef = React.useRef<HTMLUListElement>(null);

  return (
    <ElementRefContext.Provider
      value={{
        AnchoredEmojiRef,
        BodyRef,
        EmojiListRef,
        CategoryNavigationRef,
        PickerMainRef,
        SearchInputRef,
        SkinTonePickerRef,
        VariationPickerRef,
        ReactionsRef
      }}
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
  EmojiListRef: ElementRef<HTMLUListElement>;
  SkinTonePickerRef: ElementRef<HTMLDivElement>;
  SearchInputRef: ElementRef<HTMLInputElement>;
  BodyRef: ElementRef<HTMLDivElement>;
  CategoryNavigationRef: ElementRef<HTMLDivElement>;
  VariationPickerRef: ElementRef<HTMLDivElement>;
  ReactionsRef: ElementRef<HTMLUListElement>;
};

const ElementRefContext = React.createContext<ElementRefs>({
  AnchoredEmojiRef: React.createRef(),
  BodyRef: React.createRef(),
  CategoryNavigationRef: React.createRef(),
  EmojiListRef: React.createRef(),
  PickerMainRef: React.createRef(),
  SearchInputRef: React.createRef(),
  SkinTonePickerRef: React.createRef(),
  VariationPickerRef: React.createRef(),
  ReactionsRef: React.createRef()
});

function useElementRef() {
  return React.useContext(ElementRefContext);
}

export function useEmojiListRef() {
  return useElementRef()['EmojiListRef'];
}

export function usePickerMainRef() {
  return useElementRef()['PickerMainRef'];
}

export function useAnchoredEmojiRef() {
  return useElementRef()['AnchoredEmojiRef'];
}

export function useSetAnchoredEmojiRef(): (target: NullableElement) => void {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  return (target: NullableElement) => {
    if (target === null && AnchoredEmojiRef.current !== null) {
      focusElement(AnchoredEmojiRef.current);
    }

    AnchoredEmojiRef.current = target;
  };
}

export function useBodyRef() {
  return useElementRef()['BodyRef'];
}

export function useReactionsRef() {
  return useElementRef()['ReactionsRef'];
}

export function useSearchInputRef() {
  return useElementRef()['SearchInputRef'];
}

export function useSkinTonePickerRef() {
  return useElementRef()['SkinTonePickerRef'];
}

export function useCategoryNavigationRef() {
  return useElementRef()['CategoryNavigationRef'];
}

export function useVariationPickerRef() {
  return useElementRef()['VariationPickerRef'];
}
