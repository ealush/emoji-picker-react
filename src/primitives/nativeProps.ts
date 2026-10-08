import * as React from 'react';

// Native prop forwarding for public primitives (docs/v5/PRIMITIVES.md §7).
//
// Every primitive forwards ordinary native props valid for its root
// element (id, non-reserved aria-*, non-reserved data-*, title, className,
// style, ordinary event handlers). The library owns `role` on every
// primitive and reserves `data-epr-*`, internal focus-management
// attributes, and required hidden/inert state.

/** Keys never forwarded to the DOM (in addition to `data-epr-*`). */
export function filterPrimitiveProps(
  props: object,
  reserved: readonly string[],
): Record<string, unknown> {
  const forwarded: Record<string, unknown> = {};
  const values = props as Record<string, unknown>;
  for (const key of Object.keys(values)) {
    if (
      reserved.includes(key) ||
      key === 'dangerouslySetInnerHTML' ||
      key === 'children'
    ) {
      continue;
    }
    if (key.startsWith('data-epr-')) {
      continue;
    }
    forwarded[key] = values[key];
  }
  return forwarded;
}

/**
 * Handler composition (PRIMITIVES.md §8): the library behavioral handler
 * runs first, the consumer handler second with the same event. Consumer
 * `preventDefault()` is not a supported way to disable required behavior.
 * Event-handler exceptions propagate per normal React/browser behavior;
 * primitives never catch them and no ErrorBoundary is installed.
 */
export function composeHandlers<E>(
  libraryHandler: ((event: E) => void) | undefined,
  consumerHandler: ((event: E) => void) | undefined,
): ((event: E) => void) | undefined {
  if (!libraryHandler) {
    return consumerHandler;
  }
  if (!consumerHandler) {
    return libraryHandler;
  }
  return (event: E) => {
    libraryHandler(event);
    consumerHandler(event);
  };
}

/** Merge any number of refs (context ref + forwarded ref) onto one node. */
export function mergeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  const cleanups = new Map<React.Ref<T>, () => void>();
  return (node: T | null) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (typeof ref === 'function') {
        const cleanup = cleanups.get(ref);
        if (node === null && cleanup) {
          cleanups.delete(ref);
          cleanup();
        } else {
          const result = (ref as (node: T | null) => unknown)(node);
          if (typeof result === 'function')
            cleanups.set(ref, result as () => void);
        }
      } else {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

/** Keep callback refs attached while the refs themselves are unchanged. */
export function useMergedRefs<T>(
  first: React.Ref<T> | undefined,
  second: React.Ref<T> | undefined,
): React.RefCallback<T> {
  return React.useMemo(() => mergeRefs(first, second), [first, second]);
}
