import { useEffect } from 'react';
import {
  useBodyRef,
  useCategoryNavigationRef,
  usePickerMainRef,
  useSearchInputRef,
  useSkinTonePickerRef
} from '../components/context/ElementRefContext';
import { useSkinToneFanOpenState } from '../components/context/PickerContext';
import { getActiveElement } from '../DomUtils/getActiveElement';
import {
  focusFirstVisibleEmoji,
  focusNextElementSibling,
  focusNextVisibleEmoji,
  focusPrevElementSibling,
  focusPrevVisibleEmoji,
  focusVisibleEmojiOneRowDown,
  focusVisibleEmojiOneRowUp,
  hasNextElementSibling
} from '../DomUtils/keyboardNavigation';
import { useScrollTo } from '../DomUtils/scrollTo';
import { buttonFromTarget } from '../DomUtils/selectors';
import { useCloseAllOpenToggles } from './useCloseAllOpenToggles';
import { useClearSearch } from './useFilter';
import {
  useFocusCategoryNavigation,
  useFocusSearchInput,
  useFocusSkinTonePicker
} from './useFocus';

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
      event.preventDefault();
      clearSearch();
      closeAllOpenToggles();
      scrollTo(0);
      focusSearchInput();
    }
  }
}

function useSearchInputKeyboardEvents() {
  const focusSkinTonePicker = useFocusSkinTonePicker();
  const PickerMainRef = usePickerMainRef();
  const SearchInputRef = useSearchInputRef();
  const [, setSkinToneFanOpenState] = useSkinToneFanOpenState();
  const focusCategoryNavigation = useFocusCategoryNavigation();

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

    switch (key) {
      case 'ArrowRight':
        event.preventDefault();
        setSkinToneFanOpenState(true);
        focusSkinTonePicker();
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusCategoryNavigation();
        break;
    }
  }
}

function useSkinTonePickerKeyboardEvents() {
  const SkinTonePickerRef = useSkinTonePickerRef();
  const focusSearchInput = useFocusSearchInput();
  const SearchInputRef = useSearchInputRef();

  useEffect(() => {
    const current = SkinTonePickerRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [SkinTonePickerRef.current, SearchInputRef.current]);

  function onKeyDown(event: KeyboardEvent) {
    const { key } = event;

    switch (key) {
      case 'ArrowLeft':
        event.preventDefault();
        focusNextSkinTone(focusSearchInput);
        break;
      case 'ArrowRight':
        event.preventDefault();
        focusPrevSkinTone();
        break;
    }
  }
}

function useCategoryNavigationKeyboardEvents() {
  const focusSearchInput = useFocusSearchInput();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const BodyRef = useBodyRef();

  useEffect(() => {
    const current = CategoryNavigationRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [CategoryNavigationRef.current, BodyRef.current]);

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
  }
}

function useBodyKeyboardEvents() {
  const BodyRef = useBodyRef();
  useEffect(() => {
    const current = BodyRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [BodyRef.current]);

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
        focusVisibleEmojiOneRowUp(activeElement);
        break;
    }
  }
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
