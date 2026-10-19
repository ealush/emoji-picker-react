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

type Box = Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>;

const rect = (element: Element): Box => element.getBoundingClientRect();

// The visible box of a region. The grid list is as tall as all its rows,
// so it is measured by the scroll container that clips it.
const regionBox = (element: Element) =>
  rect(element.closest('[data-epr-part="viewport"]') ?? element);

const laidOut = (box: Box) => box.right > box.left || box.bottom > box.top;

// Vertical separation wins over horizontal.
const ARROWS = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'];

// A box in the arrow's frame: [start, end] along the arrow (growing in its
// direction), then [start, end] across it.
function along(box: Box, key: string): number[] {
  const { top, bottom, left, right } = box;
  const [start, end, ...across] =
    key === 'ArrowUp' || key === 'ArrowDown'
      ? [top, bottom, left, right]
      : [left, right, top, bottom];
  return key === 'ArrowUp' || key === 'ArrowLeft'
    ? [-end, -start, ...across]
    : [start, end, ...across];
}

/**
 * The arrow key that points from box `a` to box `b` on screen, or undefined
 * when they overlap. Boxes that touch or overlap by a border still count as
 * separated.
 */
export function arrowBetween(a: Box, b: Box): string | undefined {
  return ARROWS.find((key) => along(b, key)[0] >= along(a, key)[1] - 2);
}

// Distance from `a` to `b` along the arrow, plus a heavier penalty for
// sideways offset, so a box straight ahead beats a nearer diagonal one.
// Among equally near boxes, the one whose center lines up best wins (a rail
// tab spanning two cell rows enters the row it is centered on).
function distance(a: Box, b: Box, key: string): number {
  const [aStart, aEnd, aFrom, aTo] = along(a, key);
  const [bStart, bEnd, bFrom, bTo] = along(b, key);
  return (
    Math.max(0, bStart - aEnd, aStart - bEnd) +
    2 * Math.max(0, bFrom - aTo, aFrom - bTo) +
    Math.abs(bFrom + bTo - aFrom - aTo) / 2000
  );
}

/**
 * The element of `candidates` nearest to `from` along the arrow, or
 * undefined without layout. Used to enter a region next to where focus
 * came from (the cell beside a rail tab, the tab above a cell). Not
 * directional: callers pass the candidates of a region that already lies
 * in the arrow's direction (getRegionInDirection).
 */
export function nearestTo(
  from: Element,
  candidates: Element[],
  key: string,
): Element | undefined {
  const origin = rect(from);
  let best: Element | undefined;
  let bestGap = Infinity;
  if (laidOut(origin))
    candidates.forEach((candidate) => {
      const box = rect(candidate);
      const gap = laidOut(box) ? distance(origin, box, key) : Infinity;
      if (gap < bestGap) {
        best = candidate;
        bestGap = gap;
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
 * Without layout: Down/Right is the next region in DOM order, Up/Left the
 * previous one.
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
  const box = regionBox(origin.element);
  if (!laidOut(box)) {
    const step = key === 'ArrowDown' || key === 'ArrowRight' ? 1 : -1;
    const preferred = active.findIndex((region) => region.kind === prefer);
    return active[
      preferred >= 0 && (preferred - index) * step > 0
        ? preferred
        : index + step
    ];
  }
  const start =
    focused && origin.element.contains(focused) ? rect(focused) : box;
  let best: RegisteredRegion | undefined;
  let bestGap = Infinity;
  active.forEach((region) => {
    const target = regionBox(region.element);
    if (
      region === origin ||
      !laidOut(target) ||
      arrowBetween(box, target) !== key
    )
      return;
    const gap = region.kind === prefer ? -1 : distance(start, target, key);
    if (gap < bestGap) {
      best = region;
      bestGap = gap;
    }
  });
  return best;
}
