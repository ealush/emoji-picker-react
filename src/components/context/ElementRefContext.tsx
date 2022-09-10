import * as React from 'react';
import { NullableElement } from '../../DomUtils/selectors';

export function ElementRefContextProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const PickerMainRef = React.useRef<HTMLElement>(null);
  const AnchoredEmojiRef = React.useRef<HTMLElement>(null);
  const BodyRef = React.useRef<HTMLDivElement>(null);
  const SearchInputRef = React.useRef<HTMLInputElement>(null);
  const SkinTonePickerRef = React.useRef<HTMLDivElement>(null);
  const CategoryNavigationRef = React.useRef<HTMLDivElement>(null);

  return (
    <ElementRefContext.Provider
      value={{
        PickerMainRef,
        AnchoredEmojiRef,
        BodyRef,
        SearchInputRef,
        SkinTonePickerRef,
        CategoryNavigationRef
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
  SkinTonePickerRef: ElementRef<HTMLDivElement>;
  SearchInputRef: ElementRef<HTMLInputElement>;
  BodyRef: ElementRef<HTMLDivElement>;
  CategoryNavigationRef: ElementRef<HTMLDivElement>;
};

const ElementRefContext = React.createContext<ElementRefs>({
  PickerMainRef: React.createRef(),
  AnchoredEmojiRef: React.createRef(),
  BodyRef: React.createRef(),
  SearchInputRef: React.createRef(),
  SkinTonePickerRef: React.createRef(),
  CategoryNavigationRef: React.createRef()
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

export function useSetAnchoredEmojiRef(): (target: NullableElement) => void {
  const AnchoredEmojiRef = useAnchoredEmojiRef();
  return (target: NullableElement) => {
    AnchoredEmojiRef.current = target;
  };
}

export function useBodyRef() {
  return useElementRef()['BodyRef'];
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
