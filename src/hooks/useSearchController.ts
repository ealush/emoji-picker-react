import * as React from 'react';

import { useSearchInputRef } from '../components/context/ElementRefContext';
import {
  useNavigationRegistry,
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

// Controlled/uncontrolled search transition.
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

/**
 * Rejected-proposal reconciliation for controlled search.
 *
 * A rejected proposal must not persist visibly: the browser keeps the
 * native keystroke (React never rewrites an unchanged value prop), so the
 * library reconciles the input back to the latest accepted value once
 * typing goes quiet — unless the parent accepted/transformed it meanwhile
 * (then reconciling is a no-op), the input unmounted, or a composition
 * owns it. This makes an ignoring parent eventually show the prop rather
 * than leaving an optimistic value visible.
 *
 * The 500 ms quiet delay is independent of filtering's 100 ms debounce.
 * It lets ordinary typing bursts accumulate: intermediate keystrokes arrive
 * before it fires. See also pendingProposals below.
 */
const RECONCILE_AFTER_QUIET_MS = 500;

interface PendingProposal {
  proposal: string;
  accepted: string;
}

// Last controlled emission per Root, stamped with the accepted value at
// emit time. Lets a grid keystroke build on an in-flight proposal when
// the parent commit lags behind machine-speed typing, while an
// acceptance-stamp mismatch always falls back to the accepted value.
const pendingProposals = new WeakMap<
  object,
  { current: PendingProposal | null }
>();

function pendingFor(registry: object): { current: PendingProposal | null } {
  let ref = pendingProposals.get(registry);
  if (!ref) {
    ref = { current: null };
    pendingProposals.set(registry, ref);
  }
  return ref;
}

function usePendingProposal() {
  const registry = useNavigationRegistry();
  const searchValue = useSearchValueConfig();
  const record = React.useCallback(
    (proposal: string | null) => {
      pendingFor(registry).current =
        proposal === null ? null : { proposal, accepted: searchValue ?? '' };
    },
    [registry, searchValue],
  );
  const read = React.useCallback(
    () => pendingFor(registry).current,
    [registry],
  );
  return { record, read };
}

function useControlledReconcile() {
  const searchValue = useSearchValueConfig();
  const [composing] = useSearchComposingState();
  const [, setDisplay] = useSearchDisplayState();
  const acceptedRef = React.useRef(searchValue ?? '');
  acceptedRef.current = searchValue ?? '';
  const composingRef = React.useRef(composing);
  composingRef.current = composing;
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const registry = useNavigationRegistry();

  React.useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return React.useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const pending = pendingFor(registry).current;
      pendingFor(registry).current = null;
      if (composingRef.current) {
        return;
      }
      // Wipe only a still-outstanding proposal: if the parent moved on
      // (accepted/transformed), display sync already owns the value.
      // Reconcile through React state, never by writing the DOM
      // directly: a DOM-only write desyncs state from the input, and the
      // dead proposal resurfaces on the next Search rerender.
      if (pending !== null && pending.accepted === acceptedRef.current) {
        setDisplay(acceptedRef.current);
      }
    }, RECONCILE_AFTER_QUIET_MS);
  }, [registry, setDisplay]);
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
  const reconcileControlled = useControlledReconcile();
  const { record: recordProposal } = usePendingProposal();
  // Same-task echo of a just-finalized composition: the
  // browser reports the committed text through a trailing input event
  // after compositionend already emitted and synced it. Treating that
  // echo as a fresh proposal would resurrect a dead value into display
  // and duplicate the emission, so the controlled transition swallows an
  // input event carrying exactly the finalized text while this marker
  // stands. It clears on a microtask, so only same-task echoes match —
  // any later genuine edit (even identical pasted text) takes the normal
  // path, since user input always arrives in a later task.
  const compositionEchoRef = React.useRef<string | null>(null);
  const displayRef = React.useRef(display);
  displayRef.current = display;

  // Reconcile display with the accepted value whenever it changes
  // externally — but never while an IME composition owns the DOM value.
  // Draft edits must not trigger this effect: they reconcile only after
  // the quiet window. Read the current display through a ref instead.
  // The equality guard matters: an unconditional setDisplay schedules a
  // second commit per keystroke (the update bails out, but Profiler and
  // cascading-effect checks still observe it), doubling render work.
  React.useEffect(() => {
    if (!composing && accepted !== displayRef.current) {
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
      if (
        compositionEchoRef.current !== null &&
        compositionEchoRef.current === raw
      ) {
        // Trailing echo of the finalized composition: already emitted
        // and synced by compositionend; not a new proposal.
        return;
      }
      // Emit the proposal; the parent decides what becomes accepted.
      // Display tracks the proposal immediately (React-managed, so parent
      // acceptance synchronizes it immediately); rejections reconcile
      // back to the prop once typing goes quiet.
      setDisplay(raw);
      emit(raw);
      recordProposal(raw);
      reconcileControlled();
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
      recordProposal(null);
      // Reconcile to whatever the parent supplies, exactly as an ordinary
      // controlled input would after composition.
      setDisplay(searchValue ?? '');
      compositionEchoRef.current = raw;
      queueMicrotask(() => {
        if (compositionEchoRef.current === raw) {
          compositionEchoRef.current = null;
        }
      });
      return;
    }
    commit(raw);
  }

  return {
    value: display,
    handleChange,
    handleCompositionStart,
    handleCompositionEnd,
    isControlled,
  };
}

/** Grid type-to-search transition. */
export function useTypeToSearchKey() {
  const searchValue = useSearchValueConfig();
  const isControlled = searchValue !== undefined;
  const [committed] = useSearchCommittedState();
  const SearchInputRef = useSearchInputRef();
  const searchDisabled = useSearchDisabledConfig();
  const commit = useCommitSearch();
  const emit = useEmitSearchChange();
  const reconcileControlled = useControlledReconcile();
  const [, setDisplay] = useSearchDisplayState();
  const { record: recordProposal, read: readProposal } = usePendingProposal();

  return React.useCallback(
    (key: string) => {
      const input = SearchInputRef.current;
      if (searchDisabled || !input || input.disabled || input.readOnly) {
        return;
      }
      // Focus transfers synchronously so the very next keystroke is
      // already an ordinary input edit — machine-speed bursts must not
      // outrun a deferred focus.
      input.focus();
      if (isControlled) {
        // Build on the in-flight proposal when the parent commit lags;
        // fall back to the accepted value whenever the parent moved on
        // (accepted, transformed, cleared, or composed since).
        const accepted = searchValue ?? '';
        const pending = readProposal();
        const base =
          pending !== null && pending.accepted === accepted
            ? pending.proposal
            : accepted;
        // Seed the input DOM with the proposal: the grid keystroke never
        // entered the input natively, so without this the next key would
        // compute from a stale value whenever the parent commit lags.
        // This is transient view state, not accepted state — a rejection
        // still reconciles back to the prop once typing goes quiet, and
        // filtering follows only if the parent accepts the proposal.
        const proposal = `${base}${key}`;
        input.value = proposal;
        setDisplay(proposal);
        emit(proposal);
        recordProposal(proposal);
        reconcileControlled();
        return;
      }
      commit(`${committed}${key}`);
    },
    [
      searchDisabled,
      SearchInputRef,
      isControlled,
      searchValue,
      committed,
      commit,
      emit,
      readProposal,
      recordProposal,
      reconcileControlled,
      setDisplay,
    ],
  );
}

/** Explicit programmatic proposals; no input or input-controller effects required. */
export function useSetSearchValue() {
  const controlled = useIsControlledSearch();
  const commit = useCommitSearch();
  const emit = useEmitSearchChange();
  return React.useCallback(
    (value: string) => {
      if (controlled) emit(value);
      else commit(value);
    },
    [controlled, commit, emit],
  );
}

/** Clear-button / Escape transition: proposes/commits ''. */
export function useClearSearchValue() {
  const SearchInputRef = useSearchInputRef();
  const focusSearchInput = useFocusSearchInput();
  const setValue = useSetSearchValue();

  return React.useCallback(() => {
    setValue('');
    if (SearchInputRef.current) {
      // The managed input follows accepted state. A controlled parent may
      // reject the empty proposal, so clearing must not mutate the DOM.
      focusSearchInput();
    }
  }, [setValue, SearchInputRef, focusSearchInput]);
}
