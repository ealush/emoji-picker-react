import { useCallback } from 'react';
import {
  useCategoryNavigationRef,
  useSearchInputRef,
  useSkinTonePickerRef
} from '../components/context/ElementRefContext';
import { focusElement } from '../DomUtils/focusElement';
import { focusFirstElementChild } from '../DomUtils/keyboardNavigation';

export function useFocusSearchInput() {
  const SearchInputRef = useSearchInputRef();

  return useCallback(() => {
    focusElement(SearchInputRef.current);
  }, [SearchInputRef.current]);
}

export function useFocusSkinTonePicker() {
  const SkinTonePickerRef = useSkinTonePickerRef();

  return useCallback(() => {
    if (!SkinTonePickerRef.current) {
      return;
    }

    focusFirstElementChild(SkinTonePickerRef.current);
  }, [SkinTonePickerRef.current]);
}

export function useFocusCategoryNavigation() {
  const CategoryNavigationRef = useCategoryNavigationRef();

  return useCallback(() => {
    if (!CategoryNavigationRef.current) {
      return;
    }

    focusFirstElementChild(CategoryNavigationRef.current);
  }, [CategoryNavigationRef.current]);
}
