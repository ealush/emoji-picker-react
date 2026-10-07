import * as React from 'react';

import { usePickerMainRef } from '../components/context/ElementRefContext';
import { useNavigationRegistry } from '../components/context/PickerContext';
import {
  NavigationRegionKind,
  reportDuplicateRegion,
  reportPortalRegion,
} from '../state/navigationRegistry';

/**
 * Register a semantic focus region root with the Root-scoped navigation
 * registry (docs/v5/NAVIGATION.md §1–§3).
 *
 * - Registers after mount and unregisters on unmount; omitted regions
 *   (null element) stay absent from the graph — there are no placeholder
 *   or dead graph nodes.
 * - `presenceDeps` reruns registration when presence-affecting state
 *   changes (e.g. a tab bar that unmounts below two categories).
 * - Portal roots (outside the Root DOM element) are unsupported: dev
 *   warns and the region is excluded from traversal.
 * - A second singleton registration throws in development and is ignored
 *   (first wins) in production.
 */
export function useRegisterRegion(
  kind: NavigationRegionKind,
  ref: React.RefObject<Element | null> & {
    subscribe?: (listener: () => void) => () => void;
  },
  presenceDeps: readonly unknown[] = [],
): void {
  const registry = useNavigationRegistry();
  const PickerMainRef = usePickerMainRef();

  React.useEffect(() => {
    if (!registry.claimSingleton(kind)) {
      // Development throws inside; production warns once and falls
      // through to the return below, keeping the first registration
      // authoritative.
      reportDuplicateRegion(kind);
      return;
    }

    let unregister: (() => void) | undefined;
    const attach = () => {
      unregister?.();
      unregister = undefined;
      const element = ref.current;
      if (!element) return;
      const rootElement = PickerMainRef.current;
      if (rootElement && !rootElement.contains(element)) {
        reportPortalRegion(kind);
        return;
      }
      unregister = registry.register(kind, element);
    };
    attach();
    const unsubscribe = ref.subscribe?.(attach);
    return () => {
      unsubscribe?.();
      unregister?.();
      registry.releaseSingleton(kind);
    };
    // presenceDeps reruns the effect when region presence may have changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registry, kind, ref, PickerMainRef, ...presenceDeps]);
}

/**
 * Claim a structural singleton slot (Viewport/Preview, PRIMITIVES.md §4)
 * without registering a focus region. Same duplicate policy as regions.
 */
export function useSingletonClaim(kind: string): void {
  const registry = useNavigationRegistry();

  React.useEffect(() => {
    if (!registry.claimSingleton(kind)) {
      reportDuplicateRegion(kind);
      return;
    }
    return () => {
      registry.releaseSingleton(kind);
    };
  }, [registry, kind]);
}
