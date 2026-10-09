import * as React from 'react';

/* global process: readonly */

import { categoryIdFromCategoryConfig } from '../../config/categoryConfig';
import { useMutableConfig } from '../../config/mutableConfig';
import {
  useCategoriesConfig,
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

  // Initial commit only. The stamp (not a first-run flag) makes this
  // StrictMode-safe: the double-invoked mount effect commits once, since
  // the second run observes the stamp. A genuine remount creates a new
  // ref and commits its own initial value again, as it should.
  // commitFilter closes over stable refs/setters only, so the captured
  // first-render instance stays valid for this mount-only effect.
  const initialStamp = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    if (initialStamp.current !== undefined) {
      return;
    }
    const initial = mode === 'controlled' ? searchValue : defaultSearchValue;
    initialStamp.current = initial ?? null;
    if (initial) {
      commitFilter(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled updates only. Previous-value comparison keeps the mount
  // (and the StrictMode double-invoke) silent; uncontrolled commits
  // schedule through the input transition, and the default value is read
  // once, so later prop changes are ignored here.
  const prevAccepted = React.useRef(searchValue);
  React.useEffect(() => {
    if (
      mode === 'controlled' &&
      searchValue !== undefined &&
      searchValue !== prevAccepted.current
    ) {
      prevAccepted.current = searchValue;
      commitFilter(searchValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, searchValue]);

  return null;
}

// Reaction-mode observation (docs/v5/STATE.md §7). Emits only after an
// actual state change; initial mount never emits. A previous-value ref
// (not a first-run flag) makes this StrictMode-safe: the double-invoked
// mount effect observes an unchanged value both times and stays silent.
export const ReactionsModeObserver = /* @__PURE__ */ React.memo(
  function ReactionsModeObserver() {
    const [reactionsOpen] = useReactionsModeState();
    const { current } = useMutableConfig();
    const prevReactionsOpen = React.useRef(reactionsOpen);

    React.useEffect(() => {
      if (prevReactionsOpen.current === reactionsOpen) {
        return;
      }
      prevReactionsOpen.current = reactionsOpen;
      current.onReactionsModeChange?.(reactionsOpen);
    }, [reactionsOpen, current]);

    return null;
  },
);

// Root-scoped navigation generation (STATE.md §10 / PERFORMANCE.md §7).
// Reactions transitions, dataset identity changes (custom emojis included),
// category order/membership changes, and measured geometry changes each
// obsolete pending materialize/scroll/focus completions. Column-count
// changes invalidate from useCategoryHeight, search intent from
// useApplySearch, unmount from registry disposal.
export const NavigationInvalidation = /* @__PURE__ */ React.memo(
  function NavigationInvalidation() {
    const registry = useNavigationRegistry();
    const [reactionsMode] = useReactionsModeState();
    const { emojiData } = usePickerDataContext();
    const [emojiSize] = useEmojiSizeState();
    // Keyed by order/membership, not identity: the merged config is rebuilt
    // for unrelated prop changes, which must not cancel navigation.
    const categoriesKey = JSON.stringify(
      useCategoriesConfig().map(categoryIdFromCategoryConfig),
    );
    const prevSnapshot = React.useRef<
      [boolean, unknown, number | null, string]
    >([reactionsMode, emojiData, emojiSize, categoriesKey]);

    React.useEffect(() => {
      const prev = prevSnapshot.current;
      if (
        prev[0] === reactionsMode &&
        prev[1] === emojiData &&
        prev[2] === emojiSize &&
        prev[3] === categoriesKey
      ) {
        return;
      }
      prevSnapshot.current = [
        reactionsMode,
        emojiData,
        emojiSize,
        categoriesKey,
      ];
      registry.invalidate();
    }, [registry, reactionsMode, emojiData, emojiSize, categoriesKey]);

    return null;
  },
);
