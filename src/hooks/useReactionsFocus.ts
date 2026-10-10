import * as React from 'react';

import { focusElement } from '../DomUtils/focusElement';
import {
  usePickerMainRef,
  useReactionsRef,
  useSearchInputRef,
} from '../components/context/ElementRefContext';
import {
  useNavigationRegistry,
  useReactionsModeState,
} from '../components/context/PickerContext';
import { useAutoFocusSearchConfig } from '../config/useConfig';
import { getActiveRegionsInDomOrder } from '../state/regionTraversal';

import { useFocusSearchInput } from './useFocus';
import { useFocusRegion } from './useKeyboardNavigation';

// Reactions ↔ full-picker focus management.
//
// - On expansion (compact → full): the managed panel activates; after its
//   destination exists, Search is preferred when present and autofocus is
//   enabled, otherwise the next valid focusable region takes focus. No
//   focus transfer waits on an arbitrary animation timeout — effects run
//   after commit, when destinations exist.
// - On collapse (full → compact): the panel deactivates and focus restores
//   to the initiating control when it is still connected and outside the
//   now-inert panel; otherwise the first valid Reactions control.
// - Initial mount never steals focus in either mode (autofocus, when
//   enabled, remains the browser/input's own behavior).
export function useReactionsFocusManager() {
  const PickerMainRef = usePickerMainRef();
  const ReactionsRef = useReactionsRef();
  const SearchInputRef = useSearchInputRef();
  const [reactionsOpen] = useReactionsModeState();
  const autoFocusSearch = useAutoFocusSearchConfig();
  const focusSearchInput = useFocusSearchInput();
  const focusRegion = useFocusRegion();
  const registry = useNavigationRegistry();
  const lastControlRef = React.useRef<HTMLElement | null>(null);
  // Previous-value ref (not a first-run flag): StrictMode double-invokes
  // this effect on mount, and a flag would treat the second run as a
  // transition and steal focus. Comparing values keeps both runs silent.
  const prevReactionsOpen = React.useRef(reactionsOpen);

  // Remember the initiating control: the last focused element inside Root.
  React.useEffect(() => {
    const root = PickerMainRef.current;
    if (!root) {
      return;
    }
    function onFocusIn(event: FocusEvent) {
      if (event.target instanceof HTMLElement) {
        lastControlRef.current = event.target;
      }
    }
    root.addEventListener('focusin', onFocusIn);
    return () => {
      root.removeEventListener('focusin', onFocusIn);
    };
  }, [PickerMainRef]);

  React.useEffect(() => {
    if (prevReactionsOpen.current === reactionsOpen) {
      return;
    }
    prevReactionsOpen.current = reactionsOpen;
    if (!reactionsOpen) {
      focusAfterExpansion();
    } else {
      focusAfterCollapse();
    }
    // Runs on reactions-mode transitions only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactionsOpen]);

  function focusAfterExpansion() {
    if (autoFocusSearch && SearchInputRef.current) {
      focusSearchInput();
      return;
    }
    // Next valid focusable region in DOM order (Search deliberately
    // skipped here: without autofocus it is not the preferred entry).
    const root = PickerMainRef.current;
    const active = getActiveRegionsInDomOrder(registry, root).filter(
      (region) => region.kind !== 'search' && region.kind !== 'reactions',
    );
    focusRegion(active[0]);
  }

  function focusAfterCollapse() {
    const last = lastControlRef.current;
    const panel = PickerMainRef.current?.querySelector(
      '[data-epr-part="panel"]',
    );
    if (
      last &&
      last.isConnected &&
      !(panel && panel.contains(last)) &&
      isFocusable(last)
    ) {
      focusElement(last);
      return;
    }
    const firstReaction = ReactionsRef.current?.querySelector('button');
    focusElement(firstReaction ?? null);
  }

  function isFocusable(element: HTMLElement): boolean {
    if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
      return false;
    }
    if (element instanceof HTMLButtonElement && element.disabled) {
      return false;
    }
    return true;
  }
}
