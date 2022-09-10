import { useCallback, useEffect, useMemo } from 'react';

import { hasNextElementSibling } from '../DomUtils/elementPositionInRow';
import {
  focusNextElementSibling,
  focusPrevElementSibling
} from '../DomUtils/focusElement';
import { getActiveElement } from '../DomUtils/getActiveElement';
import {
  focusFirstVisibleEmoji,
  focusNextVisibleEmoji,
  focusPrevVisibleEmoji,
  focusVisibleEmojiOneRowDown,
  focusVisibleEmojiOneRowUp
} from '../DomUtils/keyboardNavigation';
import { useScrollTo } from '../DomUtils/scrollTo';
import { buttonFromTarget } from '../DomUtils/selectors';
import {
  useBodyRef,
  useCategoryNavigationRef,
  usePickerMainRef,
  useSearchInputRef,
  useSkinTonePickerRef
} from '../components/context/ElementRefContext';
import { useSkinToneFanOpenState } from '../components/context/PickerContext';

import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';
import { useClearSearch } from './useFilter';
import {
  useFocusCategoryNavigation,
  useFocusSearchInput,
  useFocusSkinTonePicker
} from './useFocus';
import useIsSearchMode from './useIsSearchMode';

export function useKeyboardNavigation() {
  usePickerMainKeyboardEvents();
  useSearchInputKeyboardEvents();
  useSkinTonePickerKeyboardEvents();
  useCategoryNavigationKeyboardEvents();
  useBodyKeyboardEvents();
}

function usePickerMainKeyboardEvents() {
  const PickerMainRef = usePickerMainRef();
  const clearSearch = useClearSearch();
  const scrollTo = useScrollTo();
  const SearchInputRef = useSearchInputRef();
  const focusSearchInput = useFocusSearchInput();

  const closeAllOpenToggles = useCloseAllOpenToggles();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        if (key === 'Escape') {
          event.preventDefault();
          clearSearch();
          closeAllOpenToggles();
          scrollTo(0);
          focusSearchInput();
        }
      },
    [scrollTo, clearSearch, closeAllOpenToggles, focusSearchInput]
  );

  useEffect(() => {
    const current = PickerMainRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [PickerMainRef, SearchInputRef, scrollTo, onKeyDown]);
}

function useSearchInputKeyboardEvents() {
  const focusSkinTonePicker = useFocusSkinTonePicker();
  const PickerMainRef = usePickerMainRef();
  const SearchInputRef = useSearchInputRef();
  const [, setSkinToneFanOpenState] = useSkinToneFanOpenState();
  const goDownFromSearchInput = useGoDownFromSearchInput();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
          case 'ArrowRight':
            event.preventDefault();
            setSkinToneFanOpenState(true);
            focusSkinTonePicker();
            break;
          case 'ArrowDown':
            event.preventDefault();
            goDownFromSearchInput();
            break;
        }
      },
    [focusSkinTonePicker, goDownFromSearchInput, setSkinToneFanOpenState]
  );

  useEffect(() => {
    const current = SearchInputRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [PickerMainRef, SearchInputRef, onKeyDown]);
}

function useSkinTonePickerKeyboardEvents() {
  const SkinTonePickerRef = useSkinTonePickerRef();
  const focusSearchInput = useFocusSearchInput();
  const SearchInputRef = useSearchInputRef();
  const goDownFromSearchInput = useGoDownFromSearchInput();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
          case 'ArrowLeft':
            event.preventDefault();
            if (!isOpen) {
              return focusSearchInput();
            }
            focusNextSkinTone(focusSearchInput);
            break;
          case 'ArrowRight':
            event.preventDefault();
            if (!isOpen) {
              return focusSearchInput();
            }
            focusPrevSkinTone();
            break;
          case 'ArrowDown':
            event.preventDefault();
            if (isOpen) {
              setIsOpen(false);
            }
            goDownFromSearchInput();
            break;
        }
      },
    [isOpen, focusSearchInput, setIsOpen, goDownFromSearchInput]
  );

  useEffect(() => {
    const current = SkinTonePickerRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [SkinTonePickerRef, SearchInputRef, isOpen, onKeyDown]);
}

function useCategoryNavigationKeyboardEvents() {
  const focusSearchInput = useFocusSearchInput();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const BodyRef = useBodyRef();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
          case 'ArrowUp':
            event.preventDefault();
            focusSearchInput();
            break;
          case 'ArrowRight':
            event.preventDefault();
            focusNextElementSibling(getActiveElement());
            break;
          case 'ArrowLeft':
            event.preventDefault();
            focusPrevElementSibling(getActiveElement());
            break;
          case 'ArrowDown':
            event.preventDefault();
            focusFirstVisibleEmoji(BodyRef.current);
            break;
        }
      },
    [BodyRef, focusSearchInput]
  );

  useEffect(() => {
    const current = CategoryNavigationRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [CategoryNavigationRef, BodyRef, onKeyDown]);
}

function useBodyKeyboardEvents() {
  const BodyRef = useBodyRef();
  const goUpFromBody = useGoUpFromBody();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        const activeElement = buttonFromTarget(getActiveElement());

        switch (key) {
          case 'ArrowRight':
            event.preventDefault();
            focusNextVisibleEmoji(activeElement);
            break;
          case 'ArrowLeft':
            event.preventDefault();
            focusPrevVisibleEmoji(activeElement);
            break;
          case 'ArrowDown':
            event.preventDefault();
            focusVisibleEmojiOneRowDown(activeElement);
            break;
          case 'ArrowUp':
            event.preventDefault();
            focusVisibleEmojiOneRowUp(activeElement, goUpFromBody);
            break;
        }
      },
    [goUpFromBody]
  );

  useEffect(() => {
    const current = BodyRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [BodyRef, onKeyDown]);
}

function useGoDownFromSearchInput() {
  const focusCategoryNavigation = useFocusCategoryNavigation();
  const isSearchMode = useIsSearchMode();
  const BodyRef = useBodyRef();

  return useCallback(
    function goDownFromSearchInput() {
      if (isSearchMode) {
        return focusFirstVisibleEmoji(BodyRef.current);
      }
      return focusCategoryNavigation();
    },
    [BodyRef, focusCategoryNavigation, isSearchMode]
  );
}

function useGoUpFromBody() {
  const focusSearchInput = useFocusSearchInput();
  const focusCategoryNavigation = useFocusCategoryNavigation();
  const isSearchMode = useIsSearchMode();

  return useCallback(
    function goUpFromEmoji() {
      if (isSearchMode) {
        return focusSearchInput();
      }
      return focusCategoryNavigation();
    },
    [focusSearchInput, isSearchMode, focusCategoryNavigation]
  );
}

function focusNextSkinTone(exitLeft: () => void) {
  const currentSkinTone = getActiveElement();

  if (!currentSkinTone) {
    return;
  }

  if (!hasNextElementSibling(currentSkinTone)) {
    exitLeft();
  }

  focusNextElementSibling(currentSkinTone);
}

function focusPrevSkinTone() {
  const currentSkinTone = getActiveElement();

  if (!currentSkinTone) {
    return;
  }

  focusPrevElementSibling(currentSkinTone);
}
