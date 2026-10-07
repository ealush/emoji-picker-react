import * as React from 'react';

import { focusElement } from '../../DomUtils/focusElement';
import { NullableElement } from '../../DomUtils/selectors';

export function ElementRefContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refs] = React.useState(createElementRefs);
  return (
    <ElementRefContext.Provider value={refs}>
      {children}
    </ElementRefContext.Provider>
  );
}

export type ElementRef<E extends HTMLElement = HTMLElement> =
  React.MutableRefObject<E | null> & {
    subscribe?: (listener: () => void) => () => void;
  };

// Observe attachment without rerendering ref consumers. Root services follow
// conditional parts, native element replacements and remounts.
function createElementRef<E extends HTMLElement>(): ElementRef<E> {
  let current: E | null = null;
  const listeners = new Set<() => void>();
  return {
    get current() {
      return current;
    },
    set current(element: E | null) {
      if (element === current) return;
      current = element;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

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

function createElementRefs(): ElementRefs {
  return {
    PickerMainRef: createElementRef(),
    AnchoredEmojiRef: createElementRef(),
    BodyRef: createElementRef<HTMLDivElement>(),
    EmojiListRef: createElementRef<HTMLUListElement>(),
    SearchInputRef: createElementRef<HTMLInputElement>(),
    SkinTonePickerRef: createElementRef<HTMLDivElement>(),
    CategoryNavigationRef: createElementRef<HTMLDivElement>(),
    VariationPickerRef: createElementRef<HTMLDivElement>(),
    ReactionsRef: createElementRef<HTMLUListElement>(),
  };
}

const ElementRefContext =
  /* @__PURE__ */ React.createContext<ElementRefs>(createElementRefs());

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
