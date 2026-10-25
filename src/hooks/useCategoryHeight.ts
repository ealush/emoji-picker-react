import * as React from 'react';

import { ClassNames } from '../DomUtils/classNames';
import {
  elementBorderBoxHeight,
  EmojiButtonSelector,
} from '../DomUtils/selectors';
import {
  useBodyRef,
  useEmojiListRef,
  usePickerMainRef,
} from '../components/context/ElementRefContext';
import {
  useNavigationRegistry,
  useReactionsModeState,
  useVisibleCategoriesState,
  useEmojiSizeState,
} from '../components/context/PickerContext';
import { useColumnsConfig } from '../config/useConfig';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

const EMOJI_SIZE_DEFAULT = 40;

// Rows live inside the category content box, not the full list:
// category margins/padding shrink the usable width, and dividing
// the raw list width would overcount columns so the last emoji in
// every row spills past the content edge (into the scrollbar).
// Measure a rendered, visible content box when one exists; fall back
// to the list width (identical when categories carry no horizontal
// inset). Hidden categories report zero width and are skipped.
function firstVisibleContentWidth(
  listEl: HTMLElement,
  fallbackWidth: number,
): number {
  const contentBoxes = listEl.querySelectorAll(
    `.${ClassNames.categoryContent}`,
  );
  for (const box of Array.from(contentBoxes)) {
    const width = (box as HTMLElement).clientWidth;
    if (width > 0) {
      return width;
    }
  }
  return fallbackWidth;
}

// A column-count change obsoletes rows computed by pending keyboard
// navigation.
function trackColumnCount(
  previousRef: React.MutableRefObject<number | undefined>,
  emojisPerRow: number,
  registry: { invalidate(): void },
): void {
  if (
    previousRef.current !== undefined &&
    previousRef.current !== emojisPerRow
  ) {
    registry.invalidate();
  }
  previousRef.current = emojisPerRow;
}

export function useCategoryHeight(
  emojiCount: number,
  ready = true,
  mounted?: boolean,
):
  | {
      categoryHeight: number;
      emojisPerRow: number;
      emojiSize: number;
      rowWidth: number;
      viewportHeight?: number;
    }
  | undefined {
  const EmojiListRef = useEmojiListRef();
  const BodyRef = useBodyRef();
  const [isReactionsMode] = useReactionsModeState();
  const PickerMainRef = usePickerMainRef();
  const emojiSizeRef = React.useRef<number | undefined>(undefined);
  const emojisPerRowRef = React.useRef<number | undefined>(undefined);
  const registry = useNavigationRegistry();
  const [visibleCategories] = useVisibleCategoriesState();
  const [emojiSizeFromContext] = useEmojiSizeState();
  const columns = useColumnsConfig();
  const [dimensions, setDimensions] = React.useState<{
    categoryHeight: number;
    emojisPerRow: number;
    emojiSize: number;
    rowWidth: number;
    viewportHeight?: number;
  }>();

  // Helper to compute and store dimensions based on current DOM
  const computeAndSetDimensions = React.useCallback(() => {
    const listEl = EmojiListRef.current;
    if (!listEl) return;

    const emojiElement = listEl.querySelector(
      EmojiButtonSelector,
    ) as HTMLElement | null;

    // Border-box geometry includes design-library button borders.
    const measured = elementBorderBoxHeight(emojiElement);
    if (measured) {
      emojiSizeRef.current = measured;
    }
    const emojiSize =
      measured ||
      emojiSizeFromContext ||
      emojiSizeRef.current ||
      EMOJI_SIZE_DEFAULT;
    const pickerWidth = listEl.clientWidth;

    if (pickerWidth === 0 || emojiSize === 0) return;

    const rowWidth = firstVisibleContentWidth(listEl, pickerWidth);
    const fit = Math.max(1, Math.floor(rowWidth / emojiSize));
    const emojisPerRow = columns ? Math.min(columns, fit) : fit;
    const rowCount = Math.ceil(emojiCount / emojisPerRow);
    const categoryHeight = rowCount * emojiSize;

    const next = {
      categoryHeight,
      emojisPerRow,
      emojiSize,
      rowWidth,
      // Virtualization reads the viewport height during render, so a picker
      // that mounts collapsed (reactions first) must re-render once it opens.
      viewportHeight: BodyRef.current?.clientHeight,
    };

    trackColumnCount(emojisPerRowRef, emojisPerRow, registry);
    // Returning `previous` when nothing changed is what stops the layout
    // effect below, which depends on `dimensions`, from looping forever.
    // Both objects come from the literal above, so their keys share an order.
    setDimensions((previous) =>
      JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
    );
  }, [
    EmojiListRef,
    BodyRef,
    emojiCount,
    emojiSizeFromContext,
    registry,
    columns,
  ]);

  // Restore measured row heights in the same commit as the filtered
  // contents. A passive effect leaves one frame of stale offsets that
  // category navigation can observe immediately after clearing search.
  // Recheck an estimated size when positioned/visible cells first mount.
  useIsomorphicLayoutEffect(() => {
    computeAndSetDimensions();
  }, [
    emojiCount,
    isReactionsMode,
    computeAndSetDimensions,
    visibleCategories.length,
    dimensions,
    ready,
    mounted,
  ]);

  // Fluid layouts (width: 100%, sheets, docks) resize without a CSS
  // transition: recompute columns when the list's width changes.
  React.useEffect(() => {
    const listEl = EmojiListRef.current;
    if (!listEl || typeof ResizeObserver === 'undefined') return;
    let lastWidth = listEl.clientWidth;
    const observer = new ResizeObserver(() => {
      const width = listEl.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      computeAndSetDimensions();
    });
    observer.observe(listEl);
    return () => observer.disconnect();
  }, [EmojiListRef, computeAndSetDimensions]);

  // Listen to transitionend on the picker root (where height transition occurs)
  React.useEffect(() => {
    const rootEl = PickerMainRef.current;
    if (!rootEl) return;

    const handler = (e: Event) => {
      const te = e as TransitionEvent;
      const prop = te.propertyName;
      if (
        prop === 'width' ||
        prop === 'max-width' ||
        prop === 'min-width' ||
        prop === 'height' ||
        prop === 'max-height' ||
        prop === 'min-height'
      ) {
        if (typeof queueMicrotask === 'function') {
          queueMicrotask(() => computeAndSetDimensions());
        } else {
          requestAnimationFrame(() => computeAndSetDimensions());
        }
      }
    };

    rootEl.addEventListener('transitionend', handler, {
      passive: true,
    });
    return () => {
      rootEl.removeEventListener('transitionend', handler);
    };
  }, [PickerMainRef, computeAndSetDimensions]);

  return dimensions;
}
