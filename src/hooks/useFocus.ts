import { useCallback } from 'react';

import { focusElement, focusFirstElementChild } from '../DomUtils/focusElement';
import {
  useCategoryNavigationRef,
  useSearchInputRef,
  useSkinTonePickerRef
} from '../components/context/ElementRefContext';
import { useOnReturnFocus, useSearchDisabledConfig } from '../config/useConfig';

export function useFocusSearchInput() {
  const SearchInputRef = useSearchInputRef();
  const searchDisabled = useSearchDisabledConfig();
  const onReturnFocus = useOnReturnFocus();

  return useCallback(() => {
    if (searchDisabled && onReturnFocus) onReturnFocus();
    else focusElement(SearchInputRef.current);
  }, [SearchInputRef, searchDisabled, onReturnFocus]);
}

export function useFocusSkinTonePicker() {
  const SkinTonePickerRef = useSkinTonePickerRef();

  return useCallback(() => {
    if (!SkinTonePickerRef.current) {
      return;
    }

    focusFirstElementChild(SkinTonePickerRef.current);
  }, [SkinTonePickerRef]);
}

export function useFocusCategoryNavigation() {
  const CategoryNavigationRef = useCategoryNavigationRef();

  return useCallback(() => {
    if (!CategoryNavigationRef.current) {
      return;
    }

    focusFirstElementChild(CategoryNavigationRef.current);
  }, [CategoryNavigationRef]);
}
