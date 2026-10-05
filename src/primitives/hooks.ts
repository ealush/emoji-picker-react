import * as React from 'react';

import {
  useActiveEmojiState,
  useActiveSkinToneState,
  useReactionsModeState,
} from '../components/context/PickerContext';
import { usePickerDataContext } from '../components/context/PickerDataContext';
import {
  useActiveCategory,
  useVisibleCategoryConfigs,
} from '../components/navigation/CategoryNavigation';
import {
  categoryIdFromCategoryConfig,
  categoryNameFromCategoryConfig,
} from '../config/categoryConfig';
import { useMutableConfig } from '../config/mutableConfig';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useAllowExpandReactions,
} from '../config/useConfig';
import { activeVariationFromUnified } from '../dataUtils/emojiUtils';
import { emojiClickOutput } from '../hooks/useMouseDownHandlers';
import {
  useEmojiDataState as useDataState,
  EmojiDataState,
} from '../hooks/useResolvedEmojiData';
import { useScrollCategoryIntoView } from '../hooks/useScrollCategoryIntoView';
import {
  useAcceptedSearchValue,
  useSetSearchValue,
  useClearSearchValue,
} from '../hooks/useSearchController';
import { useVisibleSearchResultCount } from '../hooks/useSearchResults';
import { EmojiClickData, SkinTones } from '../types/exposedTypes';

import { useRootScope } from './scope';

// Public state hooks for custom compositions. Each must be called inside
// <Root>; they read the same Root-scoped state the managed parts use, so a
// hand-built preview, skin tone control or empty state stays in sync with
// the grid, keyboard navigation and callbacks.

/**
 * The emoji currently hovered or keyboard-focused in the grid, in the same
 * shape `onEmojiClick` receives, or null. Use it to build a custom preview.
 */
export function useActiveEmoji(): EmojiClickData | null {
  useRootScope('useActiveEmoji');
  const [activeEmoji] = useActiveEmojiState();
  const [activeSkinTone] = useActiveSkinToneState();
  const { emojiByUnified } = usePickerDataContext();
  const emojiStyle = useEmojiStyleConfig();
  const getEmojiUrl = useGetEmojiUrlConfig();

  return React.useMemo(() => {
    if (!activeEmoji) {
      return null;
    }
    const emoji = emojiByUnified(
      activeEmoji.unified ?? activeEmoji.originalUnified,
    );
    if (!emoji) {
      return null;
    }
    const skinTone =
      activeVariationFromUnified(activeEmoji.unified) ?? activeSkinTone;
    return emojiClickOutput(emoji, skinTone, emojiStyle, getEmojiUrl);
  }, [activeEmoji, activeSkinTone, emojiByUnified, emojiStyle, getEmojiUrl]);
}

/**
 * The active skin tone and a setter that behaves exactly like choosing a
 * tone in the built-in control: it updates the grid and calls
 * `onSkinToneChange` (when `skinTone` is controlled, only the callback
 * fires and the parent decides).
 */
export function useSkinTone(): [SkinTones, (skinTone: SkinTones) => void] {
  const inScope = useRootScope('useSkinTone');
  const [skinTone, setActiveSkinTone] = useActiveSkinToneState();
  // The mutable config ref is stable and read at call time, so the setter
  // keeps a stable identity and always reaches the latest callback.
  const { current: callbacks } = useMutableConfig();
  const setSkinTone = React.useCallback(
    (next: SkinTones) => {
      if (!inScope) return;
      setActiveSkinTone(next);
      callbacks.onSkinToneChange?.(next);
    },
    [setActiveSkinTone, callbacks, inScope],
  );
  return [skinTone, setSkinTone];
}

export type SearchState = {
  /** Accepted raw search text (controlled value or last committed edit). */
  search: string;
  /**
   * Emojis the list shows for the applied search, or null while no search
   * is applied. Debounced like the list itself.
   */
  resultCount: number | null;
};

/** Read-only search state, e.g. for a custom status line or empty state. */
export function useSearchState(): SearchState {
  useRootScope('useSearchState');
  const search = useAcceptedSearchValue();
  const resultCount = useVisibleSearchResultCount();
  return React.useMemo(() => ({ search, resultCount }), [search, resultCount]);
}

/** Dataset loading, recoverable failure and retry for this Root. */
export function useEmojiDataState(): EmojiDataState {
  useRootScope('useEmojiDataState');
  return useDataState();
}

export type SearchActions = {
  /** Propose raw text (controlled search) or commit it (uncontrolled). */
  setValue: (value: string) => void;
  /** Clear the search and restore focus to a mounted SearchInput. */
  clear: () => void;
};

/** Propose/commit raw text. Clear also restores focus to a mounted SearchInput. */
export function useSearchActions(): SearchActions {
  useRootScope('useSearchActions');
  const setValue = useSetSearchValue();
  const clear = useClearSearchValue();
  return React.useMemo(() => ({ setValue, clear }), [setValue, clear]);
}

export type CategoryNavigation = {
  /** Visible sections in display order: category id or custom group name. */
  categories: ReadonlyArray<{ id: string; name: string }>;
  /** Id of the section currently scrolled into view, or null. */
  activeCategory: string | null;
  /** Scroll to a section by id, exactly like clicking its tab. */
  jumpToCategory: (id: string) => void;
};

/** Public section identities and the same deferred jump used by CategoryNav. */
export function useCategoryNavigation(): CategoryNavigation {
  useRootScope('useCategoryNavigation');
  const { activeCategory } = useActiveCategory();
  const configs = useVisibleCategoryConfigs();
  // The underlying jump closes over per-render state; expose a stable
  // function that always runs the latest one.
  const jump = useScrollCategoryIntoView();
  const latestJump = React.useRef(jump);
  latestJump.current = jump;
  const jumpToCategory = React.useCallback(
    (id: string) => latestJump.current(id),
    [],
  );
  // Section identity is a string per section, so a joined key keeps the
  // returned array (and object) stable across unrelated renders.
  const sections = configs.map((config) => [
    categoryIdFromCategoryConfig(config),
    categoryNameFromCategoryConfig(config),
  ]);
  const sectionsKey = JSON.stringify(sections);
  const categories = React.useMemo(
    () => sections.map(([id, name]) => ({ id, name })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectionsKey],
  );
  return React.useMemo(
    () => ({ categories, activeCategory, jumpToCategory }),
    [categories, activeCategory, jumpToCategory],
  );
}

export type PickerMode = {
  /** True while the compact reactions bar is shown instead of the full picker. */
  reactionsOpen: boolean;
  /** False when `allowExpandReactions={false}`; `expand()` then does nothing. */
  canExpand: boolean;
  /** Show the full picker. */
  expand: () => void;
  /** Return to the reactions bar. */
  collapse: () => void;
};

/** Expansion respects allowExpandReactions; collapse activates the reactions bar. */
export function usePickerMode(): PickerMode {
  useRootScope('usePickerMode');
  const [reactionsOpen, setReactionsOpen] = useReactionsModeState();
  const canExpand = useAllowExpandReactions();
  const expand = React.useCallback(() => {
    if (canExpand) setReactionsOpen(false);
  }, [canExpand, setReactionsOpen]);
  const collapse = React.useCallback(
    () => setReactionsOpen(true),
    [setReactionsOpen],
  );
  return React.useMemo(
    () => ({ reactionsOpen, canExpand, expand, collapse }),
    [reactionsOpen, canExpand, expand, collapse],
  );
}
