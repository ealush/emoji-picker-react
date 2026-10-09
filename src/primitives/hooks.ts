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
import { skinToneFromEmoji } from '../dataUtils/emojiUtils';
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
    const skinTone = skinToneFromEmoji(
      emoji,
      activeEmoji.unified,
      activeSkinTone,
    );
    return emojiClickOutput(
      { ...emoji, renderUnified: activeEmoji.unified },
      skinTone,
      emojiStyle,
      getEmojiUrl,
    );
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

/** Propose/commit raw text. Clear also restores focus to a mounted SearchInput. */
export function useSearchActions() {
  useRootScope('useSearchActions');
  const setValue = useSetSearchValue();
  const clear = useClearSearchValue();
  return React.useMemo(() => ({ setValue, clear }), [setValue, clear]);
}

/** Public section identities and the same deferred jump used by CategoryNav. */
export function useCategoryNavigation() {
  useRootScope('useCategoryNavigation');
  const { activeCategory } = useActiveCategory();
  const configs = useVisibleCategoryConfigs();
  const jumpToCategory = useScrollCategoryIntoView();
  const categories = configs.map((config) => ({
    id: categoryIdFromCategoryConfig(config),
    name: categoryNameFromCategoryConfig(config),
  }));
  return { categories, activeCategory, jumpToCategory };
}

/** Expansion respects allowExpandReactions; collapse activates the reactions bar. */
export function usePickerMode() {
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
