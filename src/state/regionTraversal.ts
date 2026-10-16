// Region traversal.
//
// An arrow key that cannot move inside a region moves to the nearest
// active region in that direction on screen, so the arrow graph follows the
// composed layout (search above or below the grid, a side rail, a bottom
// tab bar) rather than a fixed order. Without layout (no boxes, e.g. jsdom)
// it falls back to DOM document order: down/right is next, up/left is
// previous. Never registration order, render timing, or insertion order.
// Consumer nodes that are not registered regions are skipped by the arrow
// graph but stay in Tab order. Framework-free: no React import.

import {
  NavigationRegionKind,
  NavigationRegistry,
  RegisteredRegion,
} from './navigationRegistry';

/**
 * Whether a registered root is currently a valid focus destination.
 * Hidden, inert, disabled, aria-hidden, or disconnected regions are
 * filtered out before traversal. In compact reactions mode the managed
 * panel carries hidden/inert state, so its regions drop out of the active
 * list while staying registered.
 */
export function isRegionFocusable(element: Element): boolean {
  if (!element.isConnected) {
    return false;
  }
  const htmlElement = element as HTMLElement;
  if (htmlElement.hidden) {
    return false;
  }
  if (
    element.hasAttribute('hidden') ||
    element.hasAttribute('inert') ||
    (htmlElement as HTMLButtonElement).disabled
  ) {
    return false;
  }
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  if (element.closest('[hidden],[inert]')) {
    return false;
  }
  return true;
}

/**
 * Active regions in DOM document order. Portal roots (outside the Root
 * element) are unsupported and excluded. Only the authoritative (first)
 * registration per singleton kind participates.
 */
export function getActiveRegionsInDomOrder(
  registry: NavigationRegistry,
  rootElement: Element | null,
): RegisteredRegion[] {
  const seenKinds = new Set<NavigationRegionKind>();
  const active = registry.getRegions().filter((region) => {
    if (seenKinds.has(region.kind)) {
      return false;
    }
    seenKinds.add(region.kind);
    if (rootElement && !rootElement.contains(region.element)) {
      return false;
    }
    return isRegionFocusable(region.element);
  });

  active.sort((a, b) => {
    const position = a.element.compareDocumentPosition(b.element);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }

    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }
    return 0;
  });

  return active;
}

export function findRegion(
  regions: readonly RegisteredRegion[],
  kind: NavigationRegionKind,
): RegisteredRegion | undefined {
  return regions.find((region) => region.kind === kind);
}

/** Next focusable region after `from` in DOM order, if any. */
export function getNextRegion(
  registry: NavigationRegistry,
  rootElement: Element | null,
  from: NavigationRegionKind,
): RegisteredRegion | undefined {
  const active = getActiveRegionsInDomOrder(registry, rootElement);
  const index = active.findIndex((region) => region.kind === from);
  if (index === -1) {
    return undefined;
  }
  return active[index + 1];
}

/** Previous focusable region before `from` in DOM order, if any. */
export function getPrevRegion(
  registry: NavigationRegistry,
  rootElement: Element | null,
  from: NavigationRegionKind,
): RegisteredRegion | undefined {
  const active = getActiveRegionsInDomOrder(registry, rootElement);
  const index = active.findIndex((region) => region.kind === from);
  if (index <= 0) {
    return undefined;
  }
  return active[index - 1];
}

type Box = Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>;

// The visible box of a region. The grid list is as tall as all its rows,
// so it is measured by the scroll container that clips it.
function regionBox(element: Element): Box {
  return (
    element.closest('[data-epr-part="viewport"]') ?? element
  ).getBoundingClientRect();
}

const laidOut = (box: Box) => box.right > box.left || box.bottom > box.top;

// Boxes that touch or overlap by a border still count as separated.
const TOLERANCE = 2;

/**
 * The arrow key that points from region `a` to region `b` on screen
 * (vertical separation wins over horizontal), or undefined when the boxes
 * overlap. Without layout: ArrowDown when `b` follows `a` in the DOM,
 * otherwise ArrowUp.
 */
export function arrowBetween(a: Element, b: Element): string | undefined {
  const from = regionBox(a);
  const to = regionBox(b);
  if (!laidOut(from) || !laidOut(to))
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
      ? 'ArrowDown'
      : 'ArrowUp';
  if (to.top >= from.bottom - TOLERANCE) return 'ArrowDown';
  if (to.bottom <= from.top + TOLERANCE) return 'ArrowUp';
  if (to.left >= from.right - TOLERANCE) return 'ArrowRight';
  if (to.right <= from.left + TOLERANCE) return 'ArrowLeft';
  return undefined;
}

// Distance from `a` to `b` along the arrow, plus a heavier penalty for
// sideways offset, so a region straight ahead beats a nearer diagonal one.
// Among equally near boxes, the one whose center lines up best wins (a rail
// tab spanning two cell rows enters the row it is centered on).
function distance(a: Box, b: Box, key: string): number {
  const vertical = key === 'ArrowUp' || key === 'ArrowDown';
  const [near, far, start, end] = vertical
    ? (['top', 'bottom', 'left', 'right'] as const)
    : (['left', 'right', 'top', 'bottom'] as const);
  const ahead = Math.max(0, b[near] - a[far], a[near] - b[far]);
  const sideways = Math.max(0, b[start] - a[end], a[start] - b[end]);
  const centers = Math.abs(b[start] + b[end] - a[start] - a[end]) / 2;
  return ahead + 2 * sideways + centers / 1000;
}

/**
 * The element of `candidates` nearest to `from` along the arrow, or
 * undefined without layout. Used to enter a region next to where focus
 * came from (the cell beside a rail tab, the tab above a cell).
 */
export function nearestTo(
  from: Element,
  candidates: Element[],
  key: string,
): Element | undefined {
  const origin = from.getBoundingClientRect();
  let best: Element | undefined;
  let bestDistance = Infinity;
  if (!laidOut(origin)) return undefined;
  candidates.forEach((candidate) => {
    const box = candidate.getBoundingClientRect();
    const gap = laidOut(box) ? distance(origin, box, key) : Infinity;
    if (gap < bestDistance) {
      best = candidate;
      bestDistance = gap;
    }
  });
  return best;
}

/**
 * The nearest active region in the arrow's direction from `from`. Regions
 * qualify by where they lie relative to the whole `from` region; among
 * them, distance is measured from the `focused` element when it is inside
 * `from`, so a full-height rail tab leads to what is beside that tab. When
 * `prefer` lies in that direction at all it wins, even if another region
 * is closer (search and results face each other while searching).
 */
export function getRegionInDirection(
  registry: NavigationRegistry,
  rootElement: Element | null,
  from: NavigationRegionKind,
  {
    key,
    prefer,
    focused,
  }: { key: string; prefer?: NavigationRegionKind; focused?: Element | null },
): RegisteredRegion | undefined {
  const active = getActiveRegionsInDomOrder(registry, rootElement);
  const index = active.findIndex((region) => region.kind === from);
  const origin = active[index];
  if (!origin) return undefined;
  const geometric = laidOut(regionBox(origin.element));
  const box =
    focused && origin.element.contains(focused)
      ? focused.getBoundingClientRect()
      : regionBox(origin.element);
  // DOM-order fallback: a vertical tab rail leaves with Left/Right.
  const wanted = geometric
    ? key
    : key === 'ArrowRight'
      ? 'ArrowDown'
      : key === 'ArrowLeft'
        ? 'ArrowUp'
        : key;
  let best: RegisteredRegion | undefined;
  let bestDistance = Infinity;
  active.forEach((region, position) => {
    const target = regionBox(region.element);
    if (
      region === origin ||
      (geometric && !laidOut(target)) ||
      arrowBetween(origin.element, region.element) !== wanted
    )
      return;
    const gap =
      region.kind === prefer
        ? -1
        : geometric
          ? distance(box, target, key)
          : Math.abs(position - index);
    if (gap < bestDistance) {
      best = region;
      bestDistance = gap;
    }
  });
  return best;
}

/** The arrow key pointing from one active region to another, if both are active. */
export function getArrowBetweenRegions(
  registry: NavigationRegistry,
  rootElement: Element | null,
  from: NavigationRegionKind,
  to: NavigationRegionKind,
): string | undefined {
  const active = getActiveRegionsInDomOrder(registry, rootElement);
  const a = findRegion(active, from);
  const b = findRegion(active, to);
  return a && b ? arrowBetween(a.element, b.element) : undefined;
}
