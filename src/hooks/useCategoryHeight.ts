import * as React from 'react';

import { asSelectors, ClassNames } from '../DomUtils/classNames';
import { EmojiButtonSelector } from '../DomUtils/selectors';
import {
  useEmojiListRef,
  usePickerMainRef,
} from '../components/context/ElementRefContext';
import {
  useReactionsModeState,
  useVisibleCategoriesState,
  useEmojiSizeState,
} from '../components/context/PickerContext';

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
    asSelectors(ClassNames.categoryContent),
  );
  for (const box of Array.from(contentBoxes)) {
    const width = (box as HTMLElement).clientWidth;
    if (width > 0) {
      return width;
    }
  }
  return fallbackWidth;
}

export function useCategoryHeight(emojiCount: number):
  | {
      categoryHeight: number;
      emojisPerRow: number;
      emojiSize: number;
    }
  | undefined {
  const EmojiListRef = useEmojiListRef();
  const [isReactionsMode] = useReactionsModeState();
  const PickerMainRef = usePickerMainRef();
  const emojiSizeRef = React.useRef<number | undefined>();
  const [visibleCategories] = useVisibleCategoriesState();
  const [emojiSizeFromContext] = useEmojiSizeState();
  const [dimensions, setDimensions] = React.useState<{
    categoryHeight: number;
    emojisPerRow: number;
    emojiSize: number;
  }>();

  // Helper to compute and store dimensions based on current DOM
  const computeAndSetDimensions = React.useCallback(() => {
    const listEl = EmojiListRef.current;
    if (!listEl) return;

    const emojiElement = listEl.querySelector(
      EmojiButtonSelector,
    ) as HTMLElement | null;

    const measured = emojiElement?.clientHeight;
    if (measured) {
      emojiSizeRef.current = measured;
    }
    const emojiSize =
      emojiSizeFromContext ||
      measured ||
      emojiSizeRef.current ||
      EMOJI_SIZE_DEFAULT;
    const pickerWidth = listEl.clientWidth;

    if (pickerWidth === 0 || emojiSize === 0) return;

    const rowWidth = firstVisibleContentWidth(listEl, pickerWidth);
    const emojisPerRow = Math.max(1, Math.floor(rowWidth / emojiSize));
    const rowCount = Math.ceil(emojiCount / emojisPerRow);
    const categoryHeight = rowCount * emojiSize;

    setDimensions({ categoryHeight, emojisPerRow, emojiSize });
  }, [EmojiListRef, emojiCount, emojiSizeFromContext]);

  // Recompute on data-count changes and when reactions mode toggles
  React.useEffect(() => {
    computeAndSetDimensions();
  }, [
    emojiCount,
    isReactionsMode,
    computeAndSetDimensions,
    visibleCategories.length,
  ]);

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
