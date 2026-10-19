import { useCallback, useEffect, useRef } from 'react';

import { eventBelongsToPicker } from '../DomUtils/eventBelongsToPicker';
import {
  focusElement,
  focusNextElementSibling,
  focusPrevElementSibling,
} from '../DomUtils/focusElement';
import { getActiveElement } from '../DomUtils/getActiveElement';
import { idRef } from '../DomUtils/idRef';
import { isRtl } from '../DomUtils/isRtl';
import {
  categoryGeometry,
  emojisInView,
  focusFirstVisibleEmoji,
  focusAdjacentEmoji,
  focusLogicalEmoji,
} from '../DomUtils/keyboardNavigation';
import { useScrollTo } from '../DomUtils/scrollTo';
import {
  allUnifiedFromEmojiElement,
  buttonFromTarget,
  firstVisibleEmoji,
} from '../DomUtils/selectors';
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
  useSearchDisplayState,
  useSearchTermState,
  useSetActiveEmoji,
  useSkinToneFanOpenState,
} from '../components/context/PickerContext';
import {
  useKeepSearchFocusConfig,
  useSearchDisabledConfig,
  useVariationsDisabledConfig,
} from '../config/useConfig';
import {
  NavigationRegionKind,
  NavigationRegistry,
  RegisteredRegion,
} from '../state/navigationRegistry';
import { getRegionInDirection, nearestTo } from '../state/regionTraversal';

import type { SearchHighlight } from './searchHighlight';
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
import {
  useAcceptedSearchValue,
  useClearSearchValue,
  useTypeToSearchKey,
} from './useSearchController';
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
  const leave = useLeaveRegion();
  const isSearchMode = useIsSearchMode();
  const SkinTonePickerRef = useSkinTonePickerRef();
  const isSkinToneInSearch = () =>
    !!SkinTonePickerRef.current?.closest('[data-epr-part="search"]');
  const onType = useOnType();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const ReactionsRef = useReactionsRef();
  const setVariationPicker = useSetVariationPicker();
  const variationsDisabled = useVariationsDisabledConfig();
  const registry = useNavigationRegistry();
  const keepSearchFocus = useKeepSearchFocusConfig();
  const highlighter = useSearchHighlight(keepSearchFocus, registry);
  const [searchTerm] = useSearchTermState();
  const searchValue = useAcceptedSearchValue();
  // A controlled parent may not have accepted what the input shows yet.
  const [displayed] = useSearchDisplayState();
  // An Escape proposed clearing the search, and nothing has changed since:
  // a controlled parent rejected the clear, so the next Escape is the host's.
  const clearProposed = useRef(false);
  useEffect(() => {
    clearProposed.current = false;
  }, [searchValue, displayed]);
  // A highlight follows the results: once a new result set commits, it
  // moves to the first result (also when an arrow key landed on the old
  // results inside the filter debounce).
  useEffect(() => {
    highlighter.current?.highlight();
    // Per committed result set; the highlighter reads live refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);
  const main = function onKeyDown(event: KeyboardEvent) {
    const { key } = event;

    disallowMouseMove();
    switch (key) {
      case 'Escape':
        // Escape undoes one thing: an open menu, a highlight
        // (keepSearchFocus), then the search text. With nothing to undo it
        // stays untouched for the host (closing a popover or dialog).
        if (hasOpenToggles()) {
          event.preventDefault();
          closeAllOpenToggles();
          // A nested variation/tone menu consumes Escape before the
          // host popover or autocomplete dismisses the whole picker.
          event.stopPropagation();
          return;
        }
        if (highlighter.current?.highlight(null)) {
          event.preventDefault();
        } else if ((searchValue || displayed) && !clearProposed.current) {
          event.preventDefault();
          clearProposed.current = true;
          clearSearch();
          scrollTo(0);
          focusSearchInput();
        }
        break;
    }
  };
  const search = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, SearchInputRef)) return;
    const key = logicalArrowKey(event, SearchInputRef.current);

    // Modified arrows are the input's own, with or without a highlight.
    const direction = arrowDelta(event, key);
    if (keepSearchFocus && moveHighlight(event, key, direction)) return;
    if (key === 'Enter') {
      event.preventDefault();
      selectFromSearch();
    } else if (direction) {
      leaveSearch(event, key);
    }
  };
  // Left/Right edit the text; at its edge they leave for the part beside
  // the input (the tones, when they sit in Search). Up/Down leave for the
  // part above or below it.
  const leaveSearch = (event: KeyboardEvent, key: string) => {
    const sideways = key === 'ArrowLeft' || key === 'ArrowRight';
    if (sideways && !caretAtEdge(SearchInputRef.current, key === 'ArrowRight'))
      return;
    if (key === 'ArrowRight' && isSkinToneInSearch()) {
      event.preventDefault();
      setIsOpen(true);
      focusSkinTonePicker();
    } else if (leave('search', event.key)) event.preventDefault();
  };
  // keepSearchFocus: arrows move a highlight instead of focus. Until its
  // code has loaded they stay in the input. Returns whether the key was
  // taken.
  const moveHighlight = (
    event: KeyboardEvent,
    key: string,
    direction: number,
  ): boolean => {
    if (!direction) return false;
    const engine = highlighter.current;
    return !engine || engine.move(event, key, direction, isSearchMode);
  };
  // Enter in search selects the first result; with keepSearchFocus, the
  // highlighted one, without moving focus.
  const selectFromSearch = () => {
    const engine = highlighter.current;
    if (keepSearchFocus && engine?.selectFirst(isSearchMode)) return;
    const emoji = engine?.highlighted() ?? firstVisibleEmoji(BodyRef.current);
    if (!keepSearchFocus) focusElement(emoji);
    emoji?.click();
  };
  const tone = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, SkinTonePickerRef)) return;
    const key = logicalArrowKey(event, SkinTonePickerRef.current);
    const direction = arrowDelta(event, key);
    if (!direction) return onType(event);
    event.preventDefault();
    // The fan axis decides the arrow keys: the search placement and a
    // horizontal SkinTone primitive move left/right, the preview
    // placement and a vertical primitive move up/down.
    const vertical =
      SkinTonePickerRef.current?.getAttribute('data-epr-direction') ===
      'vertical';
    // A tone control inside Search returns to the input beside it; one
    // elsewhere leaves for the part in the arrow's direction.
    const inSearch = isSkinToneInSearch();
    if (vertical !== (key === 'ArrowUp' || key === 'ArrowDown')) {
      // Across the fan: leave (from Search, as the input would) and close
      // it. With nowhere to go, the fan stays open around the focused tone.
      if (leave(inSearch ? 'search' : 'preview-skin-tone', event.key))
        setIsOpen(false);
      return;
    }
    // Focusing search closes the fan; leaving elsewhere closes it here.
    // In Search the fan opens toward the input, so only that arrow
    // returns to it; the other leaves Search that way, if anything lies
    // there (only reachable while the fan is closed).
    const exit = () =>
      !inSearch
        ? leave('preview-skin-tone', event.key) && setIsOpen(false)
        : direction > 0
          ? leave('search', event.key)
          : focusSearchInput();
    if (!isOpen) return exit();
    if (direction < 0) focusNextSkinTone(exit);
    else focusPrevElementSibling(getActiveElement());
  };
  const categories = function onKeyDown(event: KeyboardEvent) {
    if (!eventInRegion(event, CategoryNavigationRef)) return;
    // Arrows along the tab axis move between tabs; arrows across it
    // leave for the part in that direction. A vertical tablist (e.g. a
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
    // Tabs, not the bar's children: a custom tab may be wrapped.
    const tabs = tabsOf(CategoryNavigationRef.current);
    const sibling =
      vertical === (key === 'ArrowUp' || key === 'ArrowDown') &&
      tabs[tabs.indexOf(getActiveElement() as HTMLElement) + direction];
    // Past the first or last tab, or across the bar: the part that way.
    if (sibling) focusElement(sibling);
    else if (!isModified(event)) leave('categories', event.key);
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
          // Past the top or bottom row, or sideways from the first or last
          // column: the part in that direction, if any. Modified arrows
          // stay in the grid.
          exit: isModified(event) ? undefined : () => leave('grid', event.key),
        });
      return;
    }
    switch (key) {
      case ' ':
        // With no menu to open, Space is the button's own: it selects.
        if (variationsDisabled) break;
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
    // Leaving the search input ends a keepSearchFocus highlight.
    const leave = (event: FocusEvent) => highlighter.current?.blur(event);
    current.addEventListener('keydown', scoped);
    current.addEventListener('focusout', leave);
    window.addEventListener('keydown', capture, true);
    return () => {
      current.removeEventListener('keydown', scoped);
      current.removeEventListener('focusout', leave);
      window.removeEventListener('keydown', capture, true);
    };
    // The highlighter ref is stable for the Root's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

// Whether the caret sits at the end (or start) of the text, with nothing
// selected: a further arrow that way cannot move inside the input.
function caretAtEdge(input: HTMLInputElement | null, end: boolean): boolean {
  if (!input || input.selectionStart !== input.selectionEnd) return false;
  return input.selectionStart === (end ? input.value.length : 0);
}

const tabsOf = (bar: Element | null) =>
  Array.from(bar?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []);

// Shift extends a selection and Ctrl/Alt move by word: a modified arrow
// never leaves a part.
const isModified = (event: KeyboardEvent) =>
  event.shiftKey || hasModifier(event);

// An arrow's step, or 0 for a modified arrow (the text field's own).
const arrowDelta = (event: KeyboardEvent, key: string) =>
  isModified(event) ? 0 : reactionFocusDelta(key);

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
// when a region took focus. An arrow `entry` lands on the cell or tab
// nearest to where focus came from. Exported for focus-restoration flows
// (reactions transitions) that target regions.
export function useFocusRegion() {
  const focusSearchInput = useFocusSearchInput();
  const focusCategoryNavigation = useFocusCategoryNavigation();
  const focusSkinTonePicker = useFocusSkinTonePicker();
  const BodyRef = useBodyRef();
  const ReactionsRef = useReactionsRef();
  const registry = useNavigationRegistry();

  return useCallback(
    function focusRegion(
      region: RegisteredRegion | undefined,
      entry?: { from: Element; key: string },
    ): boolean {
      if (!region) {
        return false;
      }

      // Grid entry is a materialize/scroll/focus operation: capture the
      // navigation generation so a stale completion cannot steal focus.
      const generation = registry.currentGeneration();
      const focusGuard = () => registry.isCurrent(generation);
      // An arrow entry lands on the candidate nearest to where it came from.
      const focusNear = (candidates: Element[], fallback: () => void) => {
        const target = entry && nearestTo(entry.from, candidates, entry.key);
        if (target) focusElement(target as HTMLElement, focusGuard);
        else fallback();
      };
      switch (region.kind as NavigationRegionKind) {
        case 'search':
          focusSearchInput();
          return true;
        case 'categories':
          focusNear(tabsOf(region.element), focusCategoryNavigation);
          return true;
        case 'grid':
          focusNear(emojisInView(BodyRef.current), () =>
            focusFirstVisibleEmoji(BodyRef.current, focusGuard),
          );
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

// keepSearchFocus's highlight engine loads on demand, once per page, the
// first time a picker with the prop mounts; pickers without it never load
// it. It stays loaded (and keeps ending a highlight on Escape, blur or new
// results) if the prop is turned off.
let engineModule: Promise<typeof import('./searchHighlight')> | undefined;
export function loadSearchHighlight() {
  return (engineModule ||= import('./searchHighlight').catch((error) => {
    engineModule = undefined;
    throw error;
  }));
}

function useSearchHighlight(enabled: boolean, registry: NavigationRegistry) {
  const main = usePickerMainRef();
  const body = useBodyRef();
  const input = useSearchInputRef();
  const setActiveEmoji = useSetActiveEmoji();
  const engine = useRef<SearchHighlight | undefined>(undefined);
  useEffect(() => {
    if (!enabled || engine.current) return;
    let live = true;
    loadSearchHighlight().then(
      ({ createSearchHighlight }) => {
        if (live && !engine.current)
          engine.current = createSearchHighlight(
            main,
            body,
            input,
            registry,
            setActiveEmoji,
            allUnifiedFromEmojiElement,
            caretAtEdge,
            firstVisibleEmoji,
            focusAdjacentEmoji,
            getRegionInDirection,
            idRef,
            categoryGeometry,
            focusLogicalEmoji,
          );
      },
      // A failed load leaves the default navigation; a remount retries.
      () => {},
    );
    return () => {
      live = false;
    };
    // Refs, registry and store setter are stable for the Root's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
  return engine;
}

const FACING: { [kind: string]: NavigationRegionKind } = {
  search: 'grid',
  grid: 'search',
};

// Moves focus to the part in the arrow's direction on screen (see
// regionTraversal). While searching, the input and the results face each
// other directly, skipping any part between them. Returns whether a part
// took focus.
function useLeaveRegion() {
  const registry = useNavigationRegistry();
  const PickerMainRef = usePickerMainRef();
  const focusRegion = useFocusRegion();
  const isSearchMode = useIsSearchMode();
  return (from: NavigationRegionKind, key: string): boolean => {
    const focused = getActiveElement();
    const region = getRegionInDirection(registry, PickerMainRef.current, from, {
      key,
      focused,
      prefer: isSearchMode ? FACING[from] : undefined,
    });
    // Entry lands next to where focus was; from the search input the grid
    // starts at the first result instead, so the best match comes first.
    return focusRegion(
      region,
      from === 'search' || !focused ? undefined : { from: focused, key },
    );
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
