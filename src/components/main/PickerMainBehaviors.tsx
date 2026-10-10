import * as React from 'react';

/* global process: readonly */

import { categoryIdFromCategoryConfig } from '../../config/categoryConfig';
import { useMutableConfig } from '../../config/mutableConfig';
import {
  useCategoriesConfig,
  useDefaultSearchValueConfig,
  useEmojiVersionConfig,
  useSearchValueConfig,
} from '../../config/useConfig';
import { useFilter } from '../../hooks/useFilter';
import {
  useActiveSkinToneState,
  useEmojiSizeState,
  useNavigationRegistry,
  useReactionsModeState,
} from '../context/PickerContext';
import { usePickerDataContext } from '../context/PickerDataContext';

// Root-scoped behavior companions shared by the default picker and the
// public Root primitive (single implementation).

// Accepted-search synchronization.
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

  const mode = searchValue !== undefined ? 'controlled' : 'uncontrolled';
  useSearchModeSwitchWarning(mode);

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

const useSearchModeSwitchWarning: (mode: string) => void =
  process.env.NODE_ENV === 'production'
    ? () => undefined
    : useDevSearchModeSwitchWarning;

function useDevSearchModeSwitchWarning(mode: string): void {
  const prevMode = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (prevMode.current !== null && prevMode.current !== mode) {
      // eslint-disable-next-line no-console
      console.warn(
        '[emoji-picker-react] Switching between controlled and uncontrolled ' +
          'search during one mounted lifetime is unsupported.',
      );
    }
    prevMode.current = mode;
  }, [mode]);
}

// Reaction-mode observation. Emits only after an
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

// Root-scoped navigation generation.
// Reactions transitions, dataset identity changes (custom emojis included),
// category order/membership changes, and measured geometry changes each
// obsolete pending materialize/scroll/focus completions. Column-count
// changes invalidate from useCategoryHeight, search intent from
// useApplySearch, unmount from registry disposal. Native glyph support is
// deliberately absent: its background check can finish at any moment
// after the first paint, and a category jump that it cancelled would
// never arrive. Jumps read their target's offset when they scroll.
export const NavigationInvalidation = /* @__PURE__ */ React.memo(
  function NavigationInvalidation() {
    const registry = useNavigationRegistry();
    const [reactionsMode] = useReactionsModeState();
    const { emojiData } = usePickerDataContext();
    const [emojiSize] = useEmojiSizeState();
    const emojiVersion = useEmojiVersionConfig();
    const [skinTone] = useActiveSkinToneState();
    // Keyed by order/membership, not identity: the merged config is rebuilt
    // for unrelated prop changes, which must not cancel navigation.
    const inventoryKey = JSON.stringify([
      useCategoriesConfig().map(categoryIdFromCategoryConfig),
      emojiVersion,
      skinTone,
    ]);
    const prevSnapshot = React.useRef<unknown[]>([
      reactionsMode,
      emojiData,
      emojiSize,
      inventoryKey,
    ]);

    React.useEffect(() => {
      const next = [reactionsMode, emojiData, emojiSize, inventoryKey];
      if (next.every((value, index) => value === prevSnapshot.current[index]))
        return;
      prevSnapshot.current = next;
      registry.invalidate();
    }, [registry, reactionsMode, emojiData, emojiSize, inventoryKey]);

    return null;
  },
);
