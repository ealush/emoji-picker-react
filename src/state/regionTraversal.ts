// DOM-document-order region traversal (docs/v5/NAVIGATION.md §3).
//
// Generic previous/next-region movement uses DOM document order of the
// currently active/focusable registered region roots — never registration
// order, render timing, or insertion order. Consumer nodes that are not
// registered regions are skipped by the arrow graph but stay in Tab order.
// Framework-free: no React import.

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
    // eslint-disable-next-line no-bitwise
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }
    // eslint-disable-next-line no-bitwise
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
