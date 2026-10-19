import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClassNames } from '../src/DomUtils/classNames';
import {
  emojisInView,
  focusAdjacentEmoji,
} from '../src/DomUtils/keyboardNavigation';

let body: HTMLElement;

// One category of `count` cells, `columns` per row. Column math needs no
// layout: it reads the logical index and the category's geometry.
function grid(count: number, columns: number) {
  body = document.createElement('div');
  body.className = ClassNames.scrollBody;
  const category = document.createElement('div');
  category.className = ClassNames.category;
  category.innerHTML = `<div data-epr-part="category-content" data-epr-emoji-count="${count}" data-epr-emojis-per-row="${columns}"></div>`;
  for (let index = 0; index < count; index++) {
    const button = document.createElement('button');
    button.className = `${ClassNames.emoji} ${ClassNames.visible}`;
    button.dataset.eprIndex = String(index);
    category.firstElementChild?.append(button);
  }
  body.append(category);
  document.body.append(body);
  return (index: number) =>
    body.querySelector<HTMLElement>(`[data-epr-index="${index}"]`)!;
}

// Moves from `index` and reports where focus went and how often the grid
// asked to leave.
function press(
  cell: (index: number) => HTMLElement,
  index: number,
  { direction, row }: { direction: number; row: boolean },
  exits: boolean,
) {
  const exit = vi.fn(() => exits);
  cell(index).focus();
  focusAdjacentEmoji(cell(index), direction, row, { exit });
  const focused = (document.activeElement as HTMLElement).dataset.eprIndex;
  return { focused: Number(focused), exits: exit.mock.calls.length };
}

const LEFT = { direction: -1, row: false };
const RIGHT = { direction: 1, row: false };
const UP = { direction: -1, row: true };
const DOWN = { direction: 1, row: true };

beforeEach(() => {
  // Focus lands in a frame; run frames at once.
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((frame) => {
    frame(0);
    return 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  body?.remove();
});

describe('moving off the edge of the grid', () => {
  // 0 1 2
  // 3 4 5
  // 6 7
  it('leaves sideways from the first and last column', () => {
    const cell = grid(8, 3);
    expect(press(cell, 3, LEFT, true)).toEqual({ focused: 3, exits: 1 });
    expect(press(cell, 5, RIGHT, true)).toEqual({ focused: 5, exits: 1 });
  });

  it('wraps through the rows when nothing is beside the grid', () => {
    const cell = grid(8, 3);
    expect(press(cell, 3, LEFT, false)).toEqual({ focused: 2, exits: 1 });
    expect(press(cell, 5, RIGHT, false)).toEqual({ focused: 6, exits: 1 });
  });

  it('moves inside a row without asking to leave', () => {
    const cell = grid(8, 3);
    expect(press(cell, 4, LEFT, true)).toEqual({ focused: 3, exits: 0 });
    expect(press(cell, 4, RIGHT, true)).toEqual({ focused: 5, exits: 0 });
  });

  it('leaves past the first and last row', () => {
    const cell = grid(8, 3);
    expect(press(cell, 1, UP, true)).toEqual({ focused: 1, exits: 1 });
    expect(press(cell, 7, DOWN, true)).toEqual({ focused: 7, exits: 1 });
    // A short last row: Down from above its gap lands on its last cell.
    expect(press(cell, 5, DOWN, true)).toEqual({ focused: 7, exits: 0 });
  });

  it('asks to leave once when the last cell is also in the last column', () => {
    // 0 1 2
    // 3 4 5
    const cell = grid(6, 3);
    expect(press(cell, 5, RIGHT, false)).toEqual({ focused: 5, exits: 1 });
  });

  it('leaves from the last cell of a short row', () => {
    const cell = grid(8, 3);
    expect(press(cell, 7, RIGHT, false)).toEqual({ focused: 7, exits: 1 });
  });
});

describe('emojisInView', () => {
  const box = (top: number, bottom: number) => () =>
    ({ top, bottom, left: 0, right: 0, height: bottom - top }) as DOMRect;

  it('keeps the cells fully inside the scroll container, below the label', () => {
    const cell = grid(5, 5);
    body.getBoundingClientRect = box(0, 100);
    const label = document.createElement('div');
    label.className = ClassNames.label;
    label.getBoundingClientRect = box(0, 20);
    body.prepend(label);
    cell(0).getBoundingClientRect = box(5, 25); // under the sticky label
    cell(1).getBoundingClientRect = box(20, 40);
    cell(2).getBoundingClientRect = box(60, 80);
    cell(3).getBoundingClientRect = box(90, 110); // cut off below
    cell(4).getBoundingClientRect = box(60, 80);
    cell(4).classList.remove(ClassNames.visible); // not rendered visible

    expect(emojisInView(body)).toEqual([cell(1), cell(2)]);
    expect(emojisInView(null)).toEqual([]);
  });
});
