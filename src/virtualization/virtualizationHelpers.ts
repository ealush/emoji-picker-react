export function shouldVirtualize({
  scrollTop,
  clientHeight,
  topOffset,
  style,
  dimensions,
}: {
  scrollTop: number;
  clientHeight: number;
  topOffset: number;
  style: { top: number } | undefined;
  dimensions: Dimensions;
}): boolean {
  if (!style || !dimensions) {
    return false;
  }

  const emojiTop = topOffset + style.top;
  const emojiBottom = emojiTop + dimensions.emojiSize;

  const isVisible =
    emojiBottom + dimensions.emojiSize * 2 >= scrollTop &&
    emojiTop <= scrollTop + clientHeight + dimensions.emojiSize;

  return !isVisible;
}

/**
 * Within one viewport above or below the visible rows, so glyphs are
 * checked before a scroll in either direction reveals them. Nothing is
 * near until the grid is measured: the first, unmeasured render would
 * otherwise request a whole category.
 */
export function isNearViewport({
  scrollTop,
  clientHeight,
  topOffset,
  style,
  dimensions,
}: {
  scrollTop: number;
  clientHeight: number;
  topOffset: number;
  style: { top: number } | undefined;
  dimensions: Dimensions;
}): boolean {
  if (!style || !dimensions || !clientHeight) return false;
  const top = topOffset + style.top;
  return (
    top + dimensions.emojiSize >= scrollTop - clientHeight &&
    top <= scrollTop + 2 * clientHeight
  );
}

// Columns spread across the row like the category grid's own
// `justify-content: space-between`: first column flush with the inline
// start, last flush with the inline end, leftover width shared evenly
// between columns. Packing from the start instead pushed the whole
// remainder (up to one emoji wide) into a gap at the end. Whole pixels
// keep image emojis crisp. The logical inset mirrors the grid under
// `dir="rtl"`, as v4's CSS grid did.
export function getEmojiPositionStyle(dimensions: Dimensions, index: number) {
  if (!dimensions) {
    return undefined;
  }
  const { emojiSize, emojisPerRow, rowWidth } = dimensions;
  const column = index % emojisPerRow;
  const remainder = Math.max(0, (rowWidth ?? 0) - emojisPerRow * emojiSize);
  const gap = emojisPerRow > 1 ? remainder / (emojisPerRow - 1) : 0;
  return {
    top: Math.floor(index / emojisPerRow) * emojiSize,
    insetInlineStart: Math.round(column * (emojiSize + gap)),
  };
}

// preload emoji if it is one row below viewport

export type Dimensions =
  | {
      emojiSize: number;
      emojisPerRow: number;
      categoryHeight: number;
      /** Usable row width the columns are distributed across. */
      rowWidth?: number;
    }
  | undefined;
