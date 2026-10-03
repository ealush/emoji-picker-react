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

// Columns spread across the row like the category grid's own
// `justify-content: space-between`: first column flush left, last flush
// right, leftover width shared evenly between columns. Packing from the
// left instead pushed the whole remainder (up to one emoji wide) into a
// gap on the right edge. Whole pixels keep image emojis crisp.
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
    left: Math.round(column * (emojiSize + gap)),
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
