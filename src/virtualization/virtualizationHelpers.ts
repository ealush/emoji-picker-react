export function shouldVirtualize({
  scrollTop,
  clientHeight,
  topOffset,
  style,
  dimensions
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

export function getEmojiPositionStyle(dimensions: Dimensions, index: number) {
  return dimensions
    ? {
        top: Math.floor(index / dimensions.emojisPerRow) * dimensions.emojiSize,
        left: (index % dimensions.emojisPerRow) * dimensions.emojiSize
      }
    : undefined;
}

// preload emoji if it is one row below viewport

export type Dimensions =
  | {
      emojiSize: number;
      emojisPerRow: number;
      categoryHeight: number;
    }
  | undefined;
