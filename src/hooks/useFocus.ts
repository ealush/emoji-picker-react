import { ClassNames } from './../DomUtils/classNames';
import { useCallback } from 'react';
import {
  useSearchInputRef,
  useSkinTonePickerRef
} from '../components/context/ElementRefContext';
import { focusElement } from '../DomUtils/focusElement';

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

    const skinTone = SkinTonePickerRef.current.querySelector(
      `.${ClassNames.active}`
    ) as HTMLElement;

    focusElement(skinTone);
  }, [SkinTonePickerRef.current]);
}
