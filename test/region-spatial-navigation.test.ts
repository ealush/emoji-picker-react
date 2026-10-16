import { afterEach, describe, expect, it } from 'vitest';

import {
  NavigationRegionKind,
  NavigationRegistry,
} from '../src/state/navigationRegistry';
import {
  getArrowBetweenRegions,
  getRegionInDirection,
  nearestTo,
} from '../src/state/regionTraversal';

type Box = { top: number; bottom: number; left: number; right: number };

let root: HTMLElement;

afterEach(() => root?.remove());

// Builds a Root whose regions are laid out at the given boxes, appended in
// the given order (DOM order). The grid list sits in a viewport, which is
// what traversal measures.
function layout(parts: [NavigationRegionKind, Box][]) {
  root = document.createElement('div');
  document.body.appendChild(root);
  const registry = new NavigationRegistry();
  for (const [kind, box] of parts) {
    let element: HTMLElement = document.createElement('div');
    let measured = element;
    if (kind === 'grid') {
      measured = element;
      measured.setAttribute('data-epr-part', 'viewport');
      element = document.createElement('ul');
      // The list is taller than the viewport that clips it.
      element.getBoundingClientRect = () =>
        ({
          top: box.top,
          bottom: box.top + 5000,
          left: 0,
          right: 0,
        }) as DOMRect;
      measured.appendChild(element);
    }
    measured.getBoundingClientRect = () => box as DOMRect;
    root.appendChild(measured);
    registry.register(kind, element);
  }
  const move = (
    from: NavigationRegionKind,
    key: string,
    prefer?: NavigationRegionKind,
    focused?: Element,
  ) =>
    getRegionInDirection(registry, root, from, { key, prefer, focused })?.kind;
  const element = (kind: NavigationRegionKind) =>
    registry.getAuthoritativeRegion(kind)!.element;
  return { registry, move, element };
}

const row = (top: number, bottom: number): Box => ({
  top,
  bottom,
  left: 0,
  right: 300,
});

describe('spatial region traversal', () => {
  it('nav, search, grid', () => {
    const { move } = layout([
      ['categories', row(0, 40)],
      ['search', row(40, 80)],
      ['grid', row(80, 380)],
    ]);
    expect(move('search', 'ArrowUp')).toBe('categories');
    expect(move('search', 'ArrowDown')).toBe('grid');
    expect(move('categories', 'ArrowDown')).toBe('search');
    expect(move('grid', 'ArrowUp')).toBe('search');
    expect(move('grid', 'ArrowDown')).toBeUndefined();
  });

  it('search, grid, nav', () => {
    const { move } = layout([
      ['search', row(0, 40)],
      ['grid', row(40, 340)],
      ['categories', row(340, 380)],
    ]);
    expect(move('search', 'ArrowUp')).toBeUndefined();
    expect(move('search', 'ArrowDown')).toBe('grid');
    expect(move('grid', 'ArrowDown')).toBe('categories');
    expect(move('categories', 'ArrowUp')).toBe('grid');
  });

  it('grid, search, nav', () => {
    const { move } = layout([
      ['grid', row(0, 300)],
      ['search', row(300, 340)],
      ['categories', row(340, 380)],
    ]);
    expect(move('search', 'ArrowUp')).toBe('grid');
    expect(move('search', 'ArrowDown')).toBe('categories');
    expect(move('grid', 'ArrowDown')).toBe('search');
    expect(move('grid', 'ArrowUp')).toBeUndefined();
    expect(move('categories', 'ArrowUp')).toBe('search');
  });

  it('follows the screen, not DOM order (CSS reordering)', () => {
    // DOM: search, grid, nav. Screen: nav on top, then search, then grid.
    const { move } = layout([
      ['search', row(40, 80)],
      ['grid', row(80, 380)],
      ['categories', row(0, 40)],
    ]);
    expect(move('search', 'ArrowUp')).toBe('categories');
    expect(move('categories', 'ArrowDown')).toBe('search');
  });

  it('a side rail leaves sideways toward the grid', () => {
    const { move } = layout([
      ['search', row(0, 40)],
      ['categories', { top: 40, bottom: 380, left: 0, right: 40 }],
      ['grid', { top: 40, bottom: 380, left: 40, right: 300 }],
    ]);
    expect(move('categories', 'ArrowRight')).toBe('grid');
    expect(move('categories', 'ArrowLeft')).toBeUndefined();
    expect(move('categories', 'ArrowUp')).toBe('search');
  });

  it('measures from the focused tab of a full-height rail', () => {
    // Discord-style: rail on the left; search above the grid on the right.
    const { move, element } = layout([
      ['categories', { top: 0, bottom: 380, left: 0, right: 40 }],
      ['search', { top: 0, bottom: 40, left: 40, right: 300 }],
      ['grid', { top: 40, bottom: 380, left: 40, right: 300 }],
    ]);
    const tab = (top: number) => {
      const button = document.createElement('button');
      button.getBoundingClientRect = () =>
        ({ top, bottom: top + 30, left: 0, right: 40 }) as DOMRect;
      element('categories').appendChild(button);
      return button;
    };
    expect(move('categories', 'ArrowRight', undefined, tab(5))).toBe('search');
    expect(move('categories', 'ArrowRight', undefined, tab(200))).toBe('grid');
  });

  it('prefers the region straight ahead over a nearer diagonal one', () => {
    const { move } = layout([
      ['search', { top: 0, bottom: 40, left: 0, right: 100 }],
      // Nearer, but off to the side.
      ['categories', { top: 45, bottom: 80, left: 200, right: 300 }],
      // Further, but directly below.
      ['grid', { top: 60, bottom: 380, left: 0, right: 100 }],
    ]);
    expect(move('search', 'ArrowDown')).toBe('grid');
  });

  it('a preferred region in that direction wins over a nearer one', () => {
    const { move } = layout([
      ['search', row(0, 40)],
      ['categories', row(40, 80)],
      ['grid', row(80, 380)],
    ]);
    expect(move('search', 'ArrowDown')).toBe('categories');
    // While searching, the input and the results face each other.
    expect(move('search', 'ArrowDown', 'grid')).toBe('grid');
    expect(move('grid', 'ArrowUp', 'search')).toBe('search');
  });

  it('ignores a preferred region that lies the other way', () => {
    const { move } = layout([
      ['grid', row(0, 300)],
      ['search', row(300, 340)],
      ['categories', row(340, 380)],
    ]);
    expect(move('search', 'ArrowDown', 'grid')).toBe('categories');
  });

  it('skips regions without a box when laid out', () => {
    const { move } = layout([
      ['search', row(0, 40)],
      // display: none, e.g. a tab bar hidden by the consumer's CSS.
      ['categories', { top: 0, bottom: 0, left: 0, right: 0 }],
      ['grid', row(80, 380)],
    ]);
    expect(move('search', 'ArrowDown')).toBe('grid');
  });

  it('falls back to DOM order without layout', () => {
    const none = { top: 0, bottom: 0, left: 0, right: 0 };
    const { move } = layout([
      ['search', none],
      ['categories', none],
      ['grid', none],
    ]);
    expect(move('search', 'ArrowDown')).toBe('categories');
    expect(move('grid', 'ArrowUp')).toBe('categories');
    expect(move('categories', 'ArrowRight')).toBe('grid');
    expect(move('categories', 'ArrowLeft')).toBe('search');
    expect(move('search', 'ArrowUp')).toBeUndefined();
  });

  it('reports which arrow points from the search input to the grid', () => {
    const above = layout([
      ['search', row(0, 40)],
      ['grid', row(40, 340)],
    ]);
    expect(getArrowBetweenRegions(above.registry, root, 'search', 'grid')).toBe(
      'ArrowDown',
    );
    root.remove();
    const below = layout([
      ['grid', row(0, 300)],
      ['search', row(300, 340)],
    ]);
    expect(getArrowBetweenRegions(below.registry, root, 'search', 'grid')).toBe(
      'ArrowUp',
    );
  });
});

describe('nearestTo', () => {
  const at = (top: number, left = 0) => {
    const element = document.createElement('div');
    element.getBoundingClientRect = () =>
      ({ top, bottom: top + 40, left, right: left + 40 }) as DOMRect;
    return element;
  };

  it('enters next to where focus came from', () => {
    // A rail tab at y 100-130, entering cells to its right.
    const tab = at(100);
    tab.getBoundingClientRect = () =>
      ({ top: 100, bottom: 130, left: 0, right: 40 }) as DOMRect;
    const rows = [0, 40, 80, 120, 160].map((top) => at(top, 50));
    // Rows 80-120 and 120-160 both touch the tab; 80-120 lines up better.
    expect(nearestTo(tab, rows, 'ArrowRight')).toBe(rows[2]);
  });

  it('has no answer without layout', () => {
    const none = document.createElement('div');
    expect(nearestTo(none, [at(0)], 'ArrowDown')).toBeUndefined();
  });
});
