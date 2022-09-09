import { useEffect } from 'react';
import {
  usePickerMainRef,
  useSearchInputRef
} from '../components/context/ElementRefContext';
import { useSkinToneFanOpenState } from '../components/context/PickerContext';
import { useScrollTo } from '../DomUtils/scrollTo';
import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';
import { useClearSearch } from './useFilter';
import { useFocusSearchInput, useFocusSkinTonePicker } from './useFocus';

export function usePickerMainKeyboardEvents() {
  const PickerMainRef = usePickerMainRef();
  const clearSearch = useClearSearch();
  const scrollTo = useScrollTo();
  const SearchInputRef = useSearchInputRef();
  const {
    closeAllOpenToggles,
    dependencyArray: CloseTogglesDependencyArray
  } = useCloseAllOpenToggles();

  useEffect(() => {
    const current = PickerMainRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [
    PickerMainRef.current,
    SearchInputRef.current,
    scrollTo,
    ...CloseTogglesDependencyArray
  ]);

  function onKeyDown(event: KeyboardEvent) {
    const { key } = event;

    if (key === 'Escape') {
      clearSearch();
      closeAllOpenToggles();
      scrollTo(0);
      useFocusSearchInput();
    }
  }
}

export function useSearchInputKeyboardEvents() {
  const focusSkinTonePicker = useFocusSkinTonePicker();
  const PickerMainRef = usePickerMainRef();
  const SearchInputRef = useSearchInputRef();
  const [, setSkinToneFanOpenState] = useSkinToneFanOpenState();

  useEffect(() => {
    const current = SearchInputRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [PickerMainRef.current, SearchInputRef.current]);

  function onKeyDown(event: KeyboardEvent) {
    const { key } = event;

    if (key === 'ArrowRight') {
      setSkinToneFanOpenState(true);
      focusSkinTonePicker();
    }
  }
}

// const handleKeyDown = (event: KeyboardEvent) => {
//   switch (event.key) {
//     case 'Enter':
//       onEnter?.();
//       break;
//     case 'Escape':
//       onEscape?.();
//       break;
//     case ' ':
//       onSpace?.();
//       break;
//     case 'Tab':
//       onTab?.();
//       break;
//     case 'ArrowUp':
//       onUp?.();
//       break;
//     case 'ArrowDown':
//       onDown?.();
//       break;
//     case 'ArrowLeft':
//       onLeft?.();
//       break;
//     case 'ArrowRight':
//       onRight?.();
//       break;
//   }
// };
