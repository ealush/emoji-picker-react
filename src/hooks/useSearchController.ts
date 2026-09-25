import * as React from 'react';

import { useSearchInputRef } from '../components/context/ElementRefContext';
import {
  useSearchCommittedState,
  useSearchComposingState,
  useSearchDisplayState,
} from '../components/context/PickerContext';
import { useMutableConfig } from '../config/mutableConfig';
import {
  useSearchDisabledConfig,
  useSearchValueConfig,
} from '../config/useConfig';

import { useFilter } from './useFilter';
import { useFocusSearchInput } from './useFocus';

// Controlled/uncontrolled search transition (docs/v5/STATE.md §1–§6).
//
// - The visible/callback value is raw user text; filtering derives a
//   normalized query and is debounced 100 ms through the shared
//   accepted-search service (`useFilter().onChange`).
// - Controlled (`searchValue` present): user edits emit an
//   `onSearchChange(proposal)` synchronously and commit nothing locally —
//   exactly like an ordinary controlled `<input>`. Filtering is scheduled
//   only when the parent supplies a new accepted `searchValue` (see
//   `SearchSync` in PickerMainBehaviors); rejected proposals schedule nothing.
// - Uncontrolled: edits commit immediately and emit when `onSearchChange`
//   is present; `defaultSearchValue` is the initial accepted value.
// - IME composition buffers in display state only; nothing commits, emits,
//   or schedules until `compositionend`, which finalizes exactly once.
// - With Search omitted/disabled, type-to-search is a no-op that leaves
//   Grid focus and search state unchanged; an explicit controlled
//   `searchValue` still filters through the provider-level sync.

export function useIsControlledSearch(): boolean {
  return useSearchValueConfig() !== undefined;
}

/** Accepted raw value: the controlled prop, or the committed value. */
export function useAcceptedSearchValue(): string {
  const searchValue = useSearchValueConfig();
  const [committed] = useSearchCommittedState();
  return searchValue ?? committed;
}

function useEmitSearchChange(): (value: string) => void {
  const { current } = useMutableConfig();
  return React.useCallback(
    (value: string) => {
      current.onSearchChange?.(value);
    },
    [current],
  );
}

function useCommitSearch(): (raw: string) => void {
  const [, setCommitted] = useSearchCommittedState();
  const [, setDisplay] = useSearchDisplayState();
  const { onChange: commitFilter } = useFilter();
  const emit = useEmitSearchChange();

  return React.useCallback(
    (raw: string) => {
      setCommitted(raw);
      setDisplay(raw);
      commitFilter(raw);
      emit(raw);
    },
    [setCommitted, setDisplay, commitFilter, emit],
  );
}

export function useSearchInputController() {
  const searchValue = useSearchValueConfig();
  const isControlled = searchValue !== undefined;
  const accepted = useAcceptedSearchValue();
  const [display, setDisplay] = useSearchDisplayState();
  const [composing, setComposing] = useSearchComposingState();
  const commit = useCommitSearch();
  const emit = useEmitSearchChange();

  // Reconcile display with the accepted value whenever it changes
  // externally — but never while an IME composition owns the DOM value.
  React.useEffect(() => {
    if (!composing) {
      setDisplay(accepted);
    }
  }, [accepted, composing, setDisplay]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const nativeComposing =
      (event.nativeEvent as InputEvent).isComposing === true;
    if (composing || nativeComposing) {
      // IME draft: visible only, no commit/emit/schedule.
      setDisplay(raw);
      return;
    }
    if (isControlled) {
      // Ordinary controlled input semantics: emit the proposal; the parent
      // decides what becomes accepted.
      emit(raw);
      return;
    }
    commit(raw);
  }

  function handleCompositionStart() {
    setComposing(true);
  }

  function handleCompositionEnd(
    event: React.CompositionEvent<HTMLInputElement>,
  ) {
    const raw = event.currentTarget.value;
    setComposing(false);
    if (isControlled) {
      emit(raw);
      // Reconcile to whatever the parent supplies, exactly as an ordinary
      // controlled input would after composition.
      setDisplay(searchValue ?? '');
      return;
    }
    commit(raw);
  }

  function handleClear() {
    if (isControlled) {
      emit('');
      return;
    }
    commit('');
  }

  return {
    value: display,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    handleClear,
    isControlled,
  };
}

/** Grid type-to-search transition (STATE.md §4). */
export function useTypeToSearchKey() {
  const searchValue = useSearchValueConfig();
  const isControlled = searchValue !== undefined;
  const [committed] = useSearchCommittedState();
  const SearchInputRef = useSearchInputRef();
  const searchDisabled = useSearchDisabledConfig();
  const focusSearchInput = useFocusSearchInput();
  const commit = useCommitSearch();
  const emit = useEmitSearchChange();

  return React.useCallback(
    (key: string) => {
      if (searchDisabled || !SearchInputRef.current) {
        return;
      }
      if (isControlled) {
        // Focus first so later keys are ordinary input edits; filtering
        // follows only if the parent accepts the proposal.
        focusSearchInput();
        emit(`${searchValue ?? ''}${key}`);
        return;
      }
      commit(`${committed}${key}`);
      focusSearchInput();
    },
    [
      searchDisabled,
      SearchInputRef,
      isControlled,
      searchValue,
      committed,
      commit,
      emit,
      focusSearchInput,
    ],
  );
}

/** Clear-button / Escape transition (STATE.md §6): proposes/commits ''. */
export function useClearSearchValue() {
  const SearchInputRef = useSearchInputRef();
  const focusSearchInput = useFocusSearchInput();
  const { handleClear } = useSearchInputController();

  return React.useCallback(() => {
    handleClear();
    if (SearchInputRef.current) {
      focusSearchInput();
    }
  }, [handleClear, SearchInputRef, focusSearchInput]);
}
