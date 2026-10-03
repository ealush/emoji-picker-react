import { describe, expect, it } from 'vitest';

import { getEmojiPositionStyle } from '../src/virtualization/virtualizationHelpers';

// Columns spread like the category grid's `justify-content: space-between`,
// so leftover row width never collects as a gap on one edge.
describe('getEmojiPositionStyle', () => {
  const dimensions = {
    emojiSize: 40,
    emojisPerRow: 8,
    categoryHeight: 400,
    rowWidth: 334, // 8 * 40 = 320, 14px left over
  };

  it('puts the first column flush left and the last flush right', () => {
    expect(getEmojiPositionStyle(dimensions, 0)).toEqual({ top: 0, left: 0 });
    const last = getEmojiPositionStyle(dimensions, 7);
    expect(last?.left).toBe(334 - 40);
  });

  it('shares the remainder evenly between columns, in whole pixels', () => {
    const lefts = Array.from(
      { length: 8 },
      (_, index) => getEmojiPositionStyle(dimensions, index)?.left as number,
    );
    lefts.forEach((left) => expect(Number.isInteger(left)).toBe(true));
    const steps = lefts.slice(1).map((left, index) => left - lefts[index]);
    expect(Math.max(...steps) - Math.min(...steps)).toBeLessThanOrEqual(1);
  });

  it('wraps rows by emoji size', () => {
    expect(getEmojiPositionStyle(dimensions, 9)).toEqual({ top: 40, left: 42 });
  });

  it('packs from the left when the row width is unknown or exact', () => {
    const { rowWidth: _omit, ...unknownWidth } = dimensions;
    expect(getEmojiPositionStyle(unknownWidth, 3)?.left).toBe(120);
    expect(
      getEmojiPositionStyle({ ...dimensions, rowWidth: 320 }, 3)?.left,
    ).toBe(120);
  });

  it('keeps a single column at the left edge', () => {
    expect(
      getEmojiPositionStyle({ ...dimensions, emojisPerRow: 1 }, 2),
    ).toEqual({ top: 80, left: 0 });
  });
});
