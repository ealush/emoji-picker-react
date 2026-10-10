import { useCallback, useEffect, useRef } from 'react';

import { eventBelongsToPicker } from '../DomUtils/eventBelongsToPicker';
import {
  focusElement,
  focusNextElementSibling,
  focusPrevElementSibling,
} from '../DomUtils/focusElement';
import { getActiveElement } from '../DomUtils/getActiveElement';
import { isRtl } from '../DomUtils/isRtl';
import {
  focusAndClickFirstVisibleEmoji,
  focusFirstVisibleEmoji,
  focusAdjacentEmoji,
} from '../DomUtils/keyboardNavigation';
import { useScrollTo } from '../DomUtils/scrollTo';
import { buttonFromTarget } from '../DomUtils/selectors';
import {
  ElementRef,
  useBodyRef,
  useCategoryNavigationRef,
  usePickerMainRef,
  useReactionsRef,
  useSearchInputRef,
  useSkinTonePickerRef,
} from '../components/context/ElementRefContext';
import {
  useNavigationRegistry,
  useSearchComposingState,
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

export function useKeyboardNavigation() {
  const ref = usePickerMainRef();
  const hasOpenToggles = useHasOpenToggles();
  const clearSearch = useClearSearchValue();
  const scrollTo = useScrollTo();
  const focusSearchInput = useFocusSearchInput();
  const disallowMouseMove = useDisallowMouseMove();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const focusSkinTonePicker = useFocusSkinTonePicker();
  const BodyRef = useBodyRef();
  const SearchInputRef = useSearchInputRef();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();
  const focusCategoryNavigation = useFocusCategoryNavigation();
  const focusNextRegionFromSearch = useFocusNextRegionFrom('search');
  const isSearchMode = useIsSearchMode();
  const SkinTonePickerRef = useSkinTonePickerRef();
  const isSkinToneInSearch = () =>
    !!SkinTonePickerRef.current?.closest('[data-epr-part="search"]');
  const onType = useOnType();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const focusPrevRegionFromCategories = useFocusPrevRegionFrom('categories');
  const focusNextRegionFromCategories = useFocusNextRegionFrom('categories');
  const ReactionsRef = useReactionsRef();
  const focusPrevRegionFromGrid = useFocusPrevRegionFrom('grid');
  const setVariationPicker = useSetVariationPicker();
  const registry = useNavigationRegistry();
  const goDownFromSearchInput = () => {
    if (isSearchMode) return focusFirstVisibleEmoji(BodyRef.current);
    focusCategoryNavigation();
  };
  const goUpFromBody = () => {
    if (isSearchMode) return focusSearchInput();
    focusPrevRegionFromGrid(focusCategoryNavigation);
  };
  const main = function onKeyDown(event: KeyboardEvent) {
    const { key } = event;

    disallowMouseMove();
    switch (key) {
      case 'Escape':
        event.preventDefault();
        if (hasOpenToggles()) {
          closeAllOpenToggles();
          // A nested variation/tone menu consumes Escape before the
          // host popover or autocomplete dismisses the whole picker.
          event.stopPropagation();
          return;
        }
        clearSearch();
        scrollTo(0);
        focusSearchInput();
        break;
    }
  };
  const search = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, SearchInputRef)) return;
    const key = logicalArrowKey(event, SearchInputRef.current);

    switch (key) {
      case 'ArrowRight':
        if (!isSkinToneInSearch()) {
          return;
        }
        event.preventDefault();
        setIsOpen(true);
        focusSkinTonePicker();
        break;
      case 'ArrowDown':
        event.preventDefault();
        // The active-search Search↔Grid exception
        // wins over generic DOM-order traversal.
        if (isSearchMode) {
          goDownFromSearchInput();
        } else {
          focusNextRegionFromSearch(goDownFromSearchInput);
        }
        break;
      case 'Enter':
        event.preventDefault();
        focusAndClickFirstVisibleEmoji(BodyRef.current);
        break;
    }
  };
  const tone = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, SkinTonePickerRef)) return;
    const key = logicalArrowKey(event, SkinTonePickerRef.current);
    // The fan axis decides the arrow keys: the search placement and a
    // horizontal SkinTone primitive move left/right, the preview
    // placement and a vertical primitive move up/down.
    const vertical =
      SkinTonePickerRef.current?.getAttribute('data-epr-direction') ===
      'vertical';

    switch (key) {
      case vertical ? 'ArrowUp' : 'ArrowLeft':
        event.preventDefault();
        if (!isOpen) return focusSearchInput();
        focusNextSkinTone(focusSearchInput);
        break;
      case vertical ? 'ArrowDown' : 'ArrowRight':
        event.preventDefault();
        if (!isOpen) return focusSearchInput();
        focusPrevElementSibling(getActiveElement());
        break;
      case 'ArrowDown':
        event.preventDefault();
        setIsOpen(false);
        goDownFromSearchInput();
        break;
      default:
        onType(event);
    }
  };
  const categories = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, CategoryNavigationRef)) return;
    // Arrows along the tab axis move between tabs; arrows across it
    // leave for the previous/next region. A vertical tablist (e.g. a
    // side rail) therefore uses Up/Down for tabs, per the ARIA tabs
    // pattern, and Left/Right to leave.
    const vertical =
      CategoryNavigationRef.current?.getAttribute('aria-orientation') ===
      'vertical';
    const key = logicalArrowKey(event, CategoryNavigationRef.current);
    const direction = reactionFocusDelta(key);

    if (!direction) {
      onType(event);
      return;
    }
    event.preventDefault();
    if (vertical === (key === 'ArrowUp' || key === 'ArrowDown')) {
      const focusSibling =
        direction > 0 ? focusNextElementSibling : focusPrevElementSibling;
      focusSibling(getActiveElement());
    } else if (direction < 0) {
      focusPrevRegionFromCategories(focusSearchInput);
    } else {
      focusNextRegionFromCategories(() =>
        focusFirstVisibleEmoji(BodyRef.current),
      );
    }
  };
  const reactions = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, ReactionsRef)) return;
    const key = logicalArrowKey(event, ReactionsRef.current);
    const current = ReactionsRef.current;

    if (!current) {
      return;
    }

    const delta = reactionFocusDelta(key);

    if (delta !== 0 && focusReactionSibling(current, delta)) {
      event.preventDefault();
    }
  };
  const body = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, BodyRef)) return;
    const key = logicalArrowKey(event, BodyRef.current);

    const activeElement = buttonFromTarget(event.target as HTMLElement);
    // Consumer controls own editing and activation; only managed emoji
    // buttons issue grid commands.
    if (!activeElement) return;

    // Navigation-generation guard: a pending
    // materialize/scroll/focus completion aborts when search, data,
    // geometry, or reactions state changed underneath it.
    const generation = registry.currentGeneration();
    const focusGuard = () => registry.isCurrent(generation);

    const direction = reactionFocusDelta(key);
    if (direction) {
      event.preventDefault();
      const row = key === 'ArrowDown' || key === 'ArrowUp';
      if (row && hasOpenToggles()) closeAllOpenToggles();
      else
        focusAdjacentEmoji(activeElement, direction, row, {
          shouldFocus: focusGuard,
          exitUp: row ? goUpFromBody : undefined,
        });
      return;
    }
    switch (key) {
      case ' ':
        event.preventDefault();
        setVariationPicker(event.target as HTMLElement);
        break;
      default:
        onType(event);
        break;
    }
  };
  const [composing] = useSearchComposingState();
  const handler = useRef<(event: KeyboardEvent, menusOnly?: boolean) => void>(
    () => {},
  );
  // One listener owns the native lifecycle; current callbacks supply state
  // and live region refs without reattaching on every picker render.
  handler.current = (event, menusOnly) => {
    if (
      composing ||
      event.isComposing ||
      event.keyCode === 229 ||
      (menusOnly && !hasOpenToggles())
    )
      return;
    if (!menusOnly) {
      search(event);
      tone(event);
      categories(event);
      reactions(event);
      body(event);
    }
    main(event);
  };
  useEffect(() => {
    // RootAside owns this native aside for its entire mounted lifetime.
    // Descendant parts are read through live refs by the delegated handler.
    const current = ref.current;
    if (!current) return;
    const scoped = (event: KeyboardEvent) => {
      if (eventBelongsToPicker(event, current)) handler.current(event);
    };
    const capture = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && eventBelongsToPicker(event, current))
        handler.current(event, true);
    };
    current.addEventListener('keydown', scoped);
    window.addEventListener('keydown', capture, true);
    return () => {
      current.removeEventListener('keydown', scoped);
      window.removeEventListener('keydown', capture, true);
    };
  }, [ref]);
}

function eventInRegion(event: KeyboardEvent, ref: ElementRef): boolean {
  return !!ref.current?.contains(event.target as Node);
}

// Arrow keys move between reaction buttons (and the expand button)
// while the reactions bar has focus. The bar lives outside the scroll
// body, so the body handler never sees these events.
// https://github.com/ealush/emoji-picker-react/issues/411

function reactionFocusDelta(key: string): number {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return 1;
    case 'ArrowLeft':
    case 'ArrowUp':
      return -1;
    default:
      return 0;
  }
}

function focusReactionSibling(root: HTMLElement, delta: number): boolean {
  const buttons = Array.from(root.querySelectorAll('button'));
  const activeIndex = buttons.indexOf(getActiveElement() as HTMLButtonElement);
  const sibling = activeIndex === -1 ? null : buttons[activeIndex + delta];

  if (!sibling) {
    return false;
  }

  focusElement(sibling);
  return true;
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
          const firstButton = ReactionsRef.current?.querySelector('button');
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
  return useFocusAdjacentRegion(from, 1);
}

function useFocusPrevRegionFrom(from: NavigationRegionKind) {
  return useFocusAdjacentRegion(from, -1);
}

function useFocusAdjacentRegion(from: NavigationRegionKind, direction: number) {
  const registry = useNavigationRegistry();
  const PickerMainRef = usePickerMainRef();
  const focusRegion = useFocusRegion();
  return (fallback?: () => void) => {
    const getRegion = direction > 0 ? getNextRegion : getPrevRegion;
    if (!focusRegion(getRegion(registry, PickerMainRef.current, from)))
      fallback?.();
  };
}

function focusNextSkinTone(exitLeft: () => void) {
  const current = getActiveElement();
  if (current && !current.nextElementSibling) exitLeft();
  focusNextElementSibling(current);
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

    // One printable letter or digit in any script (not only ASCII): the
    // localized datasets are searched in their own languages, so a Hebrew,
    // Cyrillic or Japanese keystroke on the grid starts a search like a
    // Latin one. Named keys ("Enter", "Tab") are longer than one code
    // point; space and punctuation stay unclaimed for the grid's own keys.
    if (/^[\p{L}\p{N}]$/u.test(key)) {
      event.preventDefault();
      closeAllOpenToggles();
      typeToSearch(key);
    }
  };
}

// Left/right arrows follow the visual direction: under `dir="rtl"` the
// grid, tabs, reactions and tone fan are mirrored, so ArrowLeft moves
// forward. The live region element supplies the computed direction.
function logicalArrowKey(event: KeyboardEvent, region: Element | null): string {
  const { key } = event;
  return (key === 'ArrowLeft' || key === 'ArrowRight') && isRtl(region)
    ? key === 'ArrowLeft'
      ? 'ArrowRight'
      : 'ArrowLeft'
    : key;
}

function hasModifier(event: KeyboardEvent): boolean {
  const { metaKey, ctrlKey, altKey } = event;

  return metaKey || ctrlKey || altKey;
}
