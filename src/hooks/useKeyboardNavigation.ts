import { useCallback, useEffect, useMemo } from 'react';

import { hasNextElementSibling } from '../DomUtils/elementPositionInRow';
import {
  focusNextElementSibling,
  focusPrevElementSibling
} from '../DomUtils/focusElement';
import { getActiveElement } from '../DomUtils/getActiveElement';
import {
  focusAndClickFirstVisibleEmoji,
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
import { useSearchDisabledConfig } from '../config/useConfig';

import {
  useCloseAllOpenToggles,
  useHasOpenToggles
} from './useCloseAllOpenToggles';
import { useDisallowMouseMove } from './useDisallowMouseMove';
import { useAppendSearch, useClearSearch } from './useFilter';
import {
  useFocusCategoryNavigation,
  useFocusSearchInput,
  useFocusSkinTonePicker
} from './useFocus';
import useIsSearchMode from './useIsSearchMode';
import useSetVariationPicker from './useSetVariationPicker';
import {
  useIsSkinToneInPreview,
  useIsSkinToneInSearch
} from './useShouldShowSkinTonePicker';

enum KeyboardEvents {
  ArrowDown = 'ArrowDown',
  ArrowUp = 'ArrowUp',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  Escape = 'Escape',
  Enter = 'Enter',
  Space = ' '
}

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
  const hasOpenToggles = useHasOpenToggles();
  const disallowMouseMove = useDisallowMouseMove();

  const closeAllOpenToggles = useCloseAllOpenToggles();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        disallowMouseMove();
        switch (key) {
          // eslint-disable-next-line no-fallthrough
          case KeyboardEvents.Escape:
            event.preventDefault();
            if (hasOpenToggles()) {
              closeAllOpenToggles();
              return;
            }
            clearSearch();
            scrollTo(0);
            focusSearchInput();
            break;
        }
      },
    [
      scrollTo,
      clearSearch,
      closeAllOpenToggles,
      focusSearchInput,
      hasOpenToggles,
      disallowMouseMove
    ]
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
  const BodyRef = useBodyRef();
  const SearchInputRef = useSearchInputRef();
  const [, setSkinToneFanOpenState] = useSkinToneFanOpenState();
  const goDownFromSearchInput = useGoDownFromSearchInput();
  const isSkinToneInSearch = useIsSkinToneInSearch();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
          case KeyboardEvents.ArrowRight:
            if (!isSkinToneInSearch) {
              return;
            }
            event.preventDefault();
            setSkinToneFanOpenState(true);
            focusSkinTonePicker();
            break;
          case KeyboardEvents.ArrowDown:
            event.preventDefault();
            goDownFromSearchInput();
            break;
          case KeyboardEvents.Enter:
            event.preventDefault();
            focusAndClickFirstVisibleEmoji(BodyRef.current);
            break;
        }
      },
    [
      focusSkinTonePicker,
      goDownFromSearchInput,
      setSkinToneFanOpenState,
      BodyRef,
      isSkinToneInSearch
    ]
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
  const isSkinToneInPreview = useIsSkinToneInPreview();
  const isSkinToneInSearch = useIsSkinToneInSearch();
  const onType = useOnType();

  const onKeyDown = useMemo(
    () =>
      // eslint-disable-next-line complexity
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        if (isSkinToneInSearch) {
          switch (key) {
            case KeyboardEvents.ArrowLeft:
              event.preventDefault();
              if (!isOpen) {
                return focusSearchInput();
              }
              focusNextSkinTone(focusSearchInput);
              break;
            case KeyboardEvents.ArrowRight:
              event.preventDefault();
              if (!isOpen) {
                return focusSearchInput();
              }
              focusPrevSkinTone();
              break;
            case KeyboardEvents.ArrowDown:
              event.preventDefault();
              if (isOpen) {
                setIsOpen(false);
              }
              goDownFromSearchInput();
              break;
            default:
              onType(event);
              break;
          }
        }

        if (isSkinToneInPreview) {
          switch (key) {
            case KeyboardEvents.ArrowUp:
              event.preventDefault();
              if (!isOpen) {
                return focusSearchInput();
              }
              focusNextSkinTone(focusSearchInput);
              break;
            case KeyboardEvents.ArrowDown:
              event.preventDefault();
              if (!isOpen) {
                return focusSearchInput();
              }
              focusPrevSkinTone();
              break;
            default:
              onType(event);
              break;
          }
        }
      },
    [
      isOpen,
      focusSearchInput,
      setIsOpen,
      goDownFromSearchInput,
      onType,
      isSkinToneInPreview,
      isSkinToneInSearch
    ]
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
  const onType = useOnType();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        switch (key) {
          case KeyboardEvents.ArrowUp:
            event.preventDefault();
            focusSearchInput();
            break;
          case KeyboardEvents.ArrowRight:
            event.preventDefault();
            focusNextElementSibling(getActiveElement());
            break;
          case KeyboardEvents.ArrowLeft:
            event.preventDefault();
            focusPrevElementSibling(getActiveElement());
            break;
          case KeyboardEvents.ArrowDown:
            event.preventDefault();
            focusFirstVisibleEmoji(BodyRef.current);
            break;
          default:
            onType(event);
            break;
        }
      },
    [BodyRef, focusSearchInput, onType]
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
  const setVariationPicker = useSetVariationPicker();
  const hasOpenToggles = useHasOpenToggles();
  const closeAllOpenToggles = useCloseAllOpenToggles();

  const onType = useOnType();

  const onKeyDown = useMemo(
    () =>
      // eslint-disable-next-line complexity
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        const activeElement = buttonFromTarget(getActiveElement());

        switch (key) {
          case KeyboardEvents.ArrowRight:
            event.preventDefault();
            focusNextVisibleEmoji(activeElement);
            break;
          case KeyboardEvents.ArrowLeft:
            event.preventDefault();
            focusPrevVisibleEmoji(activeElement);
            break;
          case KeyboardEvents.ArrowDown:
            event.preventDefault();
            if (hasOpenToggles()) {
              closeAllOpenToggles();
              break;
            }
            focusVisibleEmojiOneRowDown(activeElement);
            break;
          case KeyboardEvents.ArrowUp:
            event.preventDefault();
            if (hasOpenToggles()) {
              closeAllOpenToggles();
              break;
            }
            focusVisibleEmojiOneRowUp(activeElement, goUpFromBody);
            break;
          case KeyboardEvents.Space:
            event.preventDefault();
            setVariationPicker(event.target as HTMLElement);
            break;
          default:
            onType(event);
            break;
        }
      },
    [
      goUpFromBody,
      onType,
      setVariationPicker,
      hasOpenToggles,
      closeAllOpenToggles
    ]
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

function useOnType() {
  const appendSearch = useAppendSearch();
  const focusSearchInput = useFocusSearchInput();
  const searchDisabled = useSearchDisabledConfig();
  const closeAllOpenToggles = useCloseAllOpenToggles();

  return function onType(event: KeyboardEvent) {
    const { key } = event;

    if (hasModifier(event) || searchDisabled) {
      return;
    }

    if (key.match(/(^[a-zA-Z0-9]$){1}/)) {
      event.preventDefault();
      closeAllOpenToggles();
      focusSearchInput();
      appendSearch(key);
    }
  };
}

function hasModifier(event: KeyboardEvent): boolean {
  const { metaKey, ctrlKey, altKey } = event;

  return metaKey || ctrlKey || altKey;
}
