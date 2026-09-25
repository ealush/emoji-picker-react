import * as React from 'react';

/* global process: readonly */

import { useMutableConfig } from '../../config/mutableConfig';
import {
  useDefaultSearchValueConfig,
  useSearchValueConfig,
} from '../../config/useConfig';
import { useFilter } from '../../hooks/useFilter';
import {
  useEmojiSizeState,
  useNavigationRegistry,
  useReactionsModeState,
} from '../context/PickerContext';
import { usePickerDataContext } from '../context/PickerDataContext';

// Root-scoped behavior companions shared by the default picker and the
// public Root primitive (single implementation, docs/v5/DEFAULT_COMPOSITION.md).

// Accepted-search synchronization (docs/v5/STATE.md §3).
//
// Controlled mode: filtering is scheduled only when a new accepted
// `searchValue` prop is observed — a rejected `onSearchChange` proposal
// schedules nothing. A newer accepted query cancels the pending one via
// the shared debounced transition. Parent-driven changes never re-emit.
// Uncontrolled mode: the initial `defaultSearchValue` commits once on
// mount (filtering applies, but no callback fires for a non-user edit);
// later edits schedule through the input transition itself.
export function SearchSync() {
  const searchValue = useSearchValueConfig();
  const defaultSearchValue = useDefaultSearchValueConfig();
  const { onChange: commitFilter } = useFilter();
  const mounted = React.useRef(false);
  const prevMode = React.useRef<'controlled' | 'uncontrolled' | null>(null);

  const mode = searchValue !== undefined ? 'controlled' : 'uncontrolled';
  React.useEffect(() => {
    if (
      prevMode.current !== null &&
      prevMode.current !== mode &&
      process.env.NODE_ENV !== 'production'
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        '[emoji-picker-react] Switching between controlled and uncontrolled ' +
          'search during one mounted lifetime is unsupported.',
      );
    }
    prevMode.current = mode;
  }, [mode]);

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (mode === 'uncontrolled' && defaultSearchValue) {
        commitFilter(defaultSearchValue);
      } else if (mode === 'controlled' && searchValue) {
        commitFilter(searchValue);
      }
      return;
    }
    if (mode === 'controlled' && searchValue !== undefined) {
      commitFilter(searchValue);
    }
    // Uncontrolled commits schedule through the input transition; the
    // default value is read once, so later prop changes are ignored here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return null;
}

// Reaction-mode observation (docs/v5/STATE.md §7). Emits only after an
// actual state change; initial mount never emits.
export function ReactionsModeObserver() {
  const [reactionsOpen] = useReactionsModeState();
  const { current } = useMutableConfig();
  const mounted = React.useRef(false);

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    current.onReactionsModeChange?.(reactionsOpen);
  }, [reactionsOpen, current]);

  return null;
}

// Root-scoped navigation generation (STATE.md §10 / PERFORMANCE.md §7).
// Reactions transitions, dataset identity changes, and measured geometry
// changes each obsolete pending materialize/scroll/focus completions.
// Search intent invalidates from useApplySearch, unmount from registry
// disposal, so those are not duplicated here.
export function NavigationInvalidation() {
  const registry = useNavigationRegistry();
  const [reactionsMode] = useReactionsModeState();
  const { emojiData } = usePickerDataContext();
  const [emojiSize] = useEmojiSizeState();
  const mounted = React.useRef(false);

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    registry.invalidate();
  }, [registry, reactionsMode, emojiData, emojiSize]);

  return null;
}
