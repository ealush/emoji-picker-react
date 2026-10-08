import { describe, expect, it } from 'vitest';

import { getEmojiPositionStyle } from '../../src/virtualization/virtualizationHelpers';

describe('virtualized grid positioning', () => {
  const eightColumns = {
    emojiSize: 40,
    emojisPerRow: 8,
    categoryHeight: 80,
  };

  it('distributes leftover width while keeping both row edges flush', () => {
    const dimensions = { ...eightColumns, rowWidth: 345 };
    const firstRow = Array.from({ length: 8 }, (_, index) =>
      getEmojiPositionStyle(dimensions, index),
    );

    expect(firstRow.map((style) => style?.insetInlineStart)).toEqual([
      0, 44, 87, 131, 174, 218, 261, 305,
    ]);
    expect(firstRow.every((style) => style?.top === 0)).toBe(true);
    // The last 40px cell reaches the row edge; rounding never clips it.
    expect(firstRow[7]!.insetInlineStart + 40).toBe(345);
    expect(getEmojiPositionStyle(dimensions, 8)).toEqual({
      top: 40,
      insetInlineStart: 0,
    });
    expect(getEmojiPositionStyle(dimensions, 15)).toEqual({
      top: 40,
      insetInlineStart: 305,
    });
  });

  it('packs an exact-width row without introducing gaps', () => {
    expect(
      getEmojiPositionStyle({ ...eightColumns, rowWidth: 320 }, 7),
    ).toEqual({
      top: 0,
      insetInlineStart: 280,
    });
  });

  it('keeps a single column at the inline start even with spare width', () => {
    const dimensions = { ...eightColumns, emojisPerRow: 1, rowWidth: 55 };
    expect(getEmojiPositionStyle(dimensions, 0)).toEqual({
      top: 0,
      insetInlineStart: 0,
    });
    expect(getEmojiPositionStyle(dimensions, 1)).toEqual({
      top: 40,
      insetInlineStart: 0,
    });
  });

  it('preserves packed placement when row width is absent or too narrow', () => {
    expect(getEmojiPositionStyle(eightColumns, 9)).toEqual({
      top: 40,
      insetInlineStart: 40,
    });
    expect(
      getEmojiPositionStyle({ ...eightColumns, rowWidth: 300 }, 7),
    ).toEqual({
      top: 0,
      insetInlineStart: 280,
    });
  });

  it('uses only the logical inline inset so inherited RTL mirrors the row', () => {
    const style = getEmojiPositionStyle({ ...eightColumns, rowWidth: 345 }, 1);
    expect(style).toHaveProperty('insetInlineStart', 44);
    expect(style).not.toHaveProperty('left');
    expect(style).not.toHaveProperty('right');
  });

  it('waits for measured dimensions before positioning', () => {
    expect(getEmojiPositionStyle(undefined, 0)).toBeUndefined();
  });
});
