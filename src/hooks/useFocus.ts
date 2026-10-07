import { useCallback } from 'react';

import { focusElement } from '../DomUtils/focusElement';
import { NullableElement } from '../DomUtils/selectors';
import {
  ElementRef,
  useCategoryNavigationRef,
  useSearchInputRef,
  useSkinTonePickerRef,
} from '../components/context/ElementRefContext';

function useFocusRef(ref: ElementRef, child = false) {
  return useCallback(() => {
    focusElement(
      (child ? ref.current?.firstElementChild : ref.current) as NullableElement,
    );
  }, [ref, child]);
}

export function useFocusSearchInput() {
  return useFocusRef(useSearchInputRef());
}

export function useFocusSkinTonePicker() {
  return useFocusRef(useSkinTonePickerRef(), true);
}

export function useFocusCategoryNavigation() {
  return useFocusRef(useCategoryNavigationRef(), true);
}
