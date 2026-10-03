import { useCallback, useEffect, useMemo } from 'react';

import { hasNextElementSibling } from '../DomUtils/elementPositionInRow';
import {
  focusElement,
  focusNextElementSibling,
  focusPrevElementSibling,
} from '../DomUtils/focusElement';
import { getActiveElement } from '../DomUtils/getActiveElement';
import {
  focusAndClickFirstVisibleEmoji,
  focusFirstVisibleEmoji,
  focusNextVisibleEmoji,
  focusPrevVisibleEmoji,
  focusVisibleEmojiOneRowDown,
  focusVisibleEmojiOneRowUp,
} from '../DomUtils/keyboardNavigation';
import { useScrollTo } from '../DomUtils/scrollTo';
import { buttonFromTarget } from '../DomUtils/selectors';
import {
  useBodyRef,
  useCategoryNavigationRef,
  usePickerMainRef,
  useReactionsRef,
  useSearchInputRef,
  useSkinTonePickerRef,
} from '../components/context/ElementRefContext';
import {
  useNavigationRegistry,
  useReactionsModeState,
  useSkinToneFanOpenState,
} from '../components/context/PickerContext';
import { useSearchDisabledConfig } from '../config/useConfig';
import {
  NavigationRegionKind,
  RegisteredRegion,
} from '../state/navigationRegistry';
import { getNextRegion, getPrevRegion } from '../state/regionTraversal';

import {
  useCloseAllOpenToggles,
  useHasOpenToggles,
} from './useCloseAllOpenToggles';
import { useDisallowMouseMove } from './useDisallowMouseMove';
import {
  useFocusCategoryNavigation,
  useFocusSearchInput,
  useFocusSkinTonePicker,
} from './useFocus';
import useIsSearchMode from './useIsSearchMode';
import { useClearSearchValue, useTypeToSearchKey } from './useSearchController';
import useSetVariationPicker from './useSetVariationPicker';
import {
  useIsSkinToneInPreview,
  useIsSkinToneInSearch,
} from './useShouldShowSkinTonePicker';

enum KeyboardEvents {
  ArrowDown = 'ArrowDown',
  ArrowUp = 'ArrowUp',
  ArrowLeft = 'ArrowLeft',
  ArrowRight = 'ArrowRight',
  Escape = 'Escape',
  Enter = 'Enter',
  Space = ' ',
}

export function useKeyboardNavigation() {
  usePickerMainKeyboardEvents();
  useSearchInputKeyboardEvents();
  useSkinTonePickerKeyboardEvents();
  useCategoryNavigationKeyboardEvents();
  useReactionsKeyboardEvents();
  useBodyKeyboardEvents();
}

function usePickerMainKeyboardEvents() {
  const PickerMainRef = usePickerMainRef();
  const clearSearch = useClearSearchValue();
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
      disallowMouseMove,
    ],
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
  const focusNextRegionFromSearch = useFocusNextRegionFrom('search');
  const isSkinToneInSearch = useIsSkinToneInSearch();
  const isSearchMode = useIsSearchMode();

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
            // The active-search Search↔Grid exception (NAVIGATION.md §5)
            // wins over generic DOM-order traversal.
            if (isSearchMode) {
              goDownFromSearchInput();
            } else {
              focusNextRegionFromSearch(goDownFromSearchInput);
            }
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
      focusNextRegionFromSearch,
      isSearchMode,
      setSkinToneFanOpenState,
      BodyRef,
      isSkinToneInSearch,
    ],
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
        // The fan axis decides the arrow keys: the search placement and a
        // horizontal SkinTone primitive move left/right, the preview
        // placement and a vertical primitive move up/down.
        const vertical =
          isSkinToneInPreview ||
          (!isSkinToneInSearch &&
            (event.currentTarget as Element | null)?.getAttribute(
              'data-epr-direction',
            ) === 'vertical');

        if (!vertical) {
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

        if (vertical) {
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
      isSkinToneInSearch,
    ],
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
  const focusPrevRegionFromCategories = useFocusPrevRegionFrom('categories');
  const focusNextRegionFromCategories = useFocusNextRegionFrom('categories');

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        // Arrows along the tab axis move between tabs; arrows across it
        // leave for the previous/next region. A vertical tablist (e.g. a
        // side rail) therefore uses Up/Down for tabs, per the ARIA tabs
        // pattern, and Left/Right to leave.
        const vertical =
          (event.currentTarget as Element | null)?.getAttribute(
            'aria-orientation',
          ) === 'vertical';
        const intent = categoryKeyIntent(event.key, vertical);

        if (!intent) {
          onType(event);
          return;
        }
        event.preventDefault();
        switch (intent) {
          case 'prev-tab':
            focusPrevElementSibling(getActiveElement());
            break;
          case 'next-tab':
            focusNextElementSibling(getActiveElement());
            break;
          case 'prev-region':
            focusPrevRegionFromCategories(() => focusSearchInput());
            break;
          case 'next-region':
            focusNextRegionFromCategories(() =>
              focusFirstVisibleEmoji(BodyRef.current),
            );
            break;
        }
      },
    [
      BodyRef,
      focusSearchInput,
      focusPrevRegionFromCategories,
      focusNextRegionFromCategories,
      onType,
    ],
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

// Arrow keys move between reaction buttons (and the expand button)
// while the reactions bar has focus. The bar lives outside the scroll
// body, so the body handler never sees these events.
// https://github.com/ealush/emoji-picker-react/issues/411
function useReactionsKeyboardEvents() {
  const ReactionsRef = useReactionsRef();
  // The reactions bar mounts late when the user collapses the full
  // picker, so the listener effect must rerun when it opens.
  const [reactionsOpen] = useReactionsModeState();

  const onKeyDown = useMemo(
    () =>
      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;
        const current = ReactionsRef.current;

        if (!current) {
          return;
        }

        const delta = reactionFocusDelta(key);

        if (delta !== 0 && focusReactionSibling(current, delta)) {
          event.preventDefault();
        }
      },
    // reactionsOpen: the bar mounts late on collapse, and the new
    // callback identity reinstalls the listener effect below.
    [ReactionsRef, reactionsOpen],
  );

  useEffect(() => {
    const current = ReactionsRef.current;

    if (!current) {
      return;
    }

    current.addEventListener('keydown', onKeyDown);

    return () => {
      current.removeEventListener('keydown', onKeyDown);
    };
  }, [ReactionsRef, onKeyDown]);
}

function reactionFocusDelta(key: string): number {
  switch (key) {
    case KeyboardEvents.ArrowRight:
    case KeyboardEvents.ArrowDown:
      return 1;
    case KeyboardEvents.ArrowLeft:
    case KeyboardEvents.ArrowUp:
      return -1;
    default:
      return 0;
  }
}

function focusReactionSibling(root: HTMLElement, delta: number): boolean {
  const buttons = Array.from(root.querySelectorAll('button'));
  const activeIndex = buttons.indexOf(
    getActiveElement() as HTMLButtonElement,
  );
  const sibling = activeIndex === -1 ? null : buttons[activeIndex + delta];

  if (!sibling) {
    return false;
  }

  focusElement(sibling);
  return true;
}

function useBodyKeyboardEvents() {
  const BodyRef = useBodyRef();
  const goUpFromBody = useGoUpFromBody();
  const setVariationPicker = useSetVariationPicker();
  const hasOpenToggles = useHasOpenToggles();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const registry = useNavigationRegistry();

  const onType = useOnType();

  const onKeyDown = useMemo(
    () =>

      function onKeyDown(event: KeyboardEvent) {
        const { key } = event;

        const activeElement = buttonFromTarget(getActiveElement());

        // Navigation-generation guard (STATE.md §10): a pending
        // materialize/scroll/focus completion aborts when search, data,
        // geometry, or reactions state changed underneath it.
        const generation = registry.currentGeneration();
        const focusGuard = () => registry.isCurrent(generation);

        switch (key) {
          case KeyboardEvents.ArrowRight:
            event.preventDefault();
            focusNextVisibleEmoji(activeElement, focusGuard);
            break;
          case KeyboardEvents.ArrowLeft:
            event.preventDefault();
            focusPrevVisibleEmoji(activeElement, focusGuard);
            break;
          case KeyboardEvents.ArrowDown:
            event.preventDefault();
            if (hasOpenToggles()) {
              closeAllOpenToggles();
              break;
            }
            focusVisibleEmojiOneRowDown(activeElement, focusGuard);
            break;
          case KeyboardEvents.ArrowUp:
            event.preventDefault();
            if (hasOpenToggles()) {
              closeAllOpenToggles();
              break;
            }
            focusVisibleEmojiOneRowUp(activeElement, goUpFromBody, focusGuard);
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
      closeAllOpenToggles,
      registry,
    ],
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
    [BodyRef, focusCategoryNavigation, isSearchMode],
  );
}

function useGoUpFromBody() {
  const focusSearchInput = useFocusSearchInput();
  const focusCategoryNavigation = useFocusCategoryNavigation();
  const focusPrevRegionFromGrid = useFocusPrevRegionFrom('grid');
  const isSearchMode = useIsSearchMode();

  return useCallback(
    function goUpFromEmoji() {
      if (isSearchMode) {
        return focusSearchInput();
      }
      // Previous focusable region in DOM order (normally Categories), with
      // the legacy direct target as fallback when the graph is empty.
      focusPrevRegionFromGrid(() => focusCategoryNavigation());
    },
    [
      focusSearchInput,
      isSearchMode,
      focusCategoryNavigation,
      focusPrevRegionFromGrid,
    ],
  );
}

// Cross-region focus through the registered semantic graph. Returns true
// when a region handled the move; callers keep their legacy direct target
// as fallback so unregistered trees behave exactly as before. Exported for
// focus-restoration flows (reactions transitions) that target regions.
export function useFocusRegion() {
  const focusSearchInput = useFocusSearchInput();
  const focusCategoryNavigation = useFocusCategoryNavigation();
  const focusSkinTonePicker = useFocusSkinTonePicker();
  const BodyRef = useBodyRef();
  const ReactionsRef = useReactionsRef();
  const registry = useNavigationRegistry();

  return useCallback(
    function focusRegion(region: RegisteredRegion | undefined): boolean {
      if (!region) {
        return false;
      }
      // Grid entry is a materialize/scroll/focus operation: capture the
      // navigation generation so a stale completion cannot steal focus.
      const generation = registry.currentGeneration();
      const focusGuard = () => registry.isCurrent(generation);
      switch (region.kind as NavigationRegionKind) {
        case 'search':
          focusSearchInput();
          return true;
        case 'categories':
          focusCategoryNavigation();
          return true;
        case 'grid':
          focusFirstVisibleEmoji(BodyRef.current, focusGuard);
          return true;
        case 'reactions': {
          const firstButton =
            ReactionsRef.current?.querySelector('button');
          focusElement(firstButton ?? null, focusGuard);
          return true;
        }
        case 'preview-skin-tone':
          focusSkinTonePicker();
          return true;
      }
    },
    [
      focusSearchInput,
      focusCategoryNavigation,
      focusSkinTonePicker,
      BodyRef,
      ReactionsRef,
      registry,
    ],
  );
}

function useFocusNextRegionFrom(from: NavigationRegionKind) {
  const registry = useNavigationRegistry();
  const PickerMainRef = usePickerMainRef();
  const focusRegion = useFocusRegion();

  return useCallback(
    function focusNextRegion(fallback?: () => void) {
      const next = getNextRegion(registry, PickerMainRef.current, from);
      if (!focusRegion(next)) {
        fallback?.();
      }
    },
    [registry, PickerMainRef, focusRegion, from],
  );
}

function useFocusPrevRegionFrom(from: NavigationRegionKind) {
  const registry = useNavigationRegistry();
  const PickerMainRef = usePickerMainRef();
  const focusRegion = useFocusRegion();

  return useCallback(
    function focusPrevRegion(fallback?: () => void) {
      const prev = getPrevRegion(registry, PickerMainRef.current, from);
      if (!focusRegion(prev)) {
        fallback?.();
      }
    },
    [registry, PickerMainRef, focusRegion, from],
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
  const typeToSearch = useTypeToSearchKey();
  const searchDisabled = useSearchDisabledConfig();
  const SearchInputRef = useSearchInputRef();
  const closeAllOpenToggles = useCloseAllOpenToggles();

  return function onType(event: KeyboardEvent) {
    const { key } = event;

    if (hasModifier(event) || searchDisabled) {
      return;
    }

    // No search input mounted (a bare Root without Search): the
    // transition would no-op, so the key is left unclaimed — no
    // preventDefault, no toggle closing — exactly like searchDisabled.
    if (!SearchInputRef.current) {
      return;
    }

    if (key.match(/(^[a-zA-Z0-9]$){1}/)) {
      event.preventDefault();
      closeAllOpenToggles();
      typeToSearch(key);
    }
  };
}

function hasModifier(event: KeyboardEvent): boolean {
  const { metaKey, ctrlKey, altKey } = event;

  return metaKey || ctrlKey || altKey;
}

type CategoryKeyIntent = 'prev-tab' | 'next-tab' | 'prev-region' | 'next-region';

const HORIZONTAL_CATEGORY_KEYS: Record<string, CategoryKeyIntent> = {
  [KeyboardEvents.ArrowLeft]: 'prev-tab',
  [KeyboardEvents.ArrowRight]: 'next-tab',
  [KeyboardEvents.ArrowUp]: 'prev-region',
  [KeyboardEvents.ArrowDown]: 'next-region',
};

const VERTICAL_CATEGORY_KEYS: Record<string, CategoryKeyIntent> = {
  [KeyboardEvents.ArrowUp]: 'prev-tab',
  [KeyboardEvents.ArrowDown]: 'next-tab',
  [KeyboardEvents.ArrowLeft]: 'prev-region',
  [KeyboardEvents.ArrowRight]: 'next-region',
};

function categoryKeyIntent(
  key: string,
  vertical: boolean,
): CategoryKeyIntent | undefined {
  return (vertical ? VERTICAL_CATEGORY_KEYS : HORIZONTAL_CATEGORY_KEYS)[key];
}
