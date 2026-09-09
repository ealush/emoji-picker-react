import { describe, expect, it, vi } from 'vitest';

import { elementCountInRow } from '../../src/DomUtils/elementPositionInRow';

function mockRect(element: HTMLElement, width: number) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: () => undefined,
  });
}

describe('elementCountInRow', () => {
  it('prefers the measured per-row count when the category declares it', () => {
    // Regression test for https://github.com/ealush/emoji-picker-react/issues/502
    // The virtualized layout positions emojis with a fixed per-row count.
    // When fractional widths make floor(parentWidth / elementWidth) disagree
    // with that count, arrow-up/arrow-down drift sideways by a column.
    // The declared count is the single source of truth.
    const parent = document.createElement('div');
    const element = document.createElement('button');
    parent.appendChild(element);
    parent.setAttribute('data-emojis-per-row', '9');
    mockRect(parent, 348);
    mockRect(element, 40);

    // floor(348 / 40) === 8, but the layout was positioned with 9 per row.
    expect(elementCountInRow(parent, element)).toBe(9);
  });

  it('falls back to rect math when no count is declared', () => {
    const parent = document.createElement('div');
    const element = document.createElement('button');
    parent.appendChild(element);
    mockRect(parent, 320);
    mockRect(element, 40);

    expect(elementCountInRow(parent, element)).toBe(8);
  });

  it('returns 0 when parent or element is missing', () => {
    const element = document.createElement('button');
    expect(elementCountInRow(null, element)).toBe(0);
    expect(elementCountInRow(document.createElement('div'), null)).toBe(0);
  });
});
