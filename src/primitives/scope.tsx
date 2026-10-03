import * as React from 'react';

/* global process: readonly */

// Primitive scope validation (docs/v5/PRIMITIVES.md §4).
//
// Render-time context validation fails immediately in development:
// - any primitive outside Root;
// - List outside Viewport.
// In production the validators warn once and report out-of-scope so the
// primitive renders null: production avoids the hard crash, and a null is
// diagnosable whereas continuing would die later with a confusing
// TypeError deep inside provider-dependent behavior.
// Registration-time singleton validation lives in the navigation registry.
// Server rendering performs only render-time context validation; there is
// no post-mount validation during SSR. Exact development error text is not
// semver API.

interface RootScope {
  readonly root: true;
}

const RootScopeContext = React.createContext<RootScope | null>(null);

export function RootScopeProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo<RootScope>(() => ({ root: true }), []);
  return (
    <RootScopeContext.Provider value={value}>
      {children}
    </RootScopeContext.Provider>
  );
}

const warnedOutsideRoot = new Set<string>();

export function useRootScope(primitive: string): boolean {
  const scope = React.useContext(RootScopeContext);
  if (scope) {
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    if (!warnedOutsideRoot.has(primitive)) {
      warnedOutsideRoot.add(primitive);
      // eslint-disable-next-line no-console
      console.warn(
        `[emoji-picker-react] <${primitive}> rendered outside <Root>; ` +
          `picker behavior is unavailable.`,
      );
    }
    return false;
  }
  throw new Error(
    (primitive.startsWith('use')
      ? `[emoji-picker-react] ${primitive}() must be called inside <Root>. `
      : `[emoji-picker-react] <${primitive}> must be rendered inside <Root>. `) +
      `See docs/v5/PRIMITIVES.md composition grammar.`,
  );
}

const ViewportScopeContext = React.createContext<boolean>(false);

export const ViewportScrollContext = React.createContext<number>(0);

export function useViewportScrollTop(): number {
  return React.useContext(ViewportScrollContext);
}
export function ViewportScopeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewportScopeContext.Provider value={true}>
      {children}
    </ViewportScopeContext.Provider>
  );
}

const warnedOutsideViewport = new Set<string>();

export function useViewportScope(primitive: string): boolean {
  const inside = React.useContext(ViewportScopeContext);
  if (inside) {
    return true;
  }
  if (process.env.NODE_ENV === 'production') {
    if (!warnedOutsideViewport.has(primitive)) {
      warnedOutsideViewport.add(primitive);
      // eslint-disable-next-line no-console
      console.warn(
        `[emoji-picker-react] <${primitive}> rendered outside <Viewport>; ` +
          `it must be the single direct child of <Viewport>.`,
      );
    }
    return false;
  }
  throw new Error(
    `[emoji-picker-react] <${primitive}> must be the single direct child ` +
      `of <Viewport>. See docs/v5/PRIMITIVES.md composition grammar.`,
  );
}

/** Test-only: reset warn-once sets between cases. */
export function __resetPrimitiveWarningsForTest(): void {
  warnedOutsideRoot.clear();
  warnedOutsideViewport.clear();
}
