// Imperative Root-scoped navigation registry (v5 Phase 3 shell).
//
// Cross-region keyboard navigation (docs/v5/NAVIGATION.md, implemented in
// Phase 4) traverses registered semantic regions rather than hard-coded DOM
// siblings. This module owns registration bookkeeping plus the navigation
// generation token from docs/v5/STATE.md §10: every pending
// materialize/scroll/focus operation captures the generation and aborts when
// it changes. One instance lives in the Root services slice, so multiple
// Roots are isolated by construction.
//
// Framework-free on purpose: no React import, fully unit-testable, and the
// `/data` entry never touches it. Runtime code here stays within the
// React 16.8 API floor (see npm run check:react-floor).

/** Semantic focus regions. The managed panel and Viewport are structural containers, not regions. */
export type NavigationRegionKind =
  | 'search'
  | 'categories'
  | 'grid'
  | 'preview-skin-tone'
  | 'reactions';

export interface RegisteredRegion {
  readonly id: number;
  readonly kind: NavigationRegionKind;
  readonly element: Element;
}

export class NavigationRegistry {
  private nextId = 1;
  private regions: RegisteredRegion[] = [];
  private singletons = new Set<string>();
  private generation = 0;
  private disposed = false;

  /**
   * Register a region root. Returns an unregister function for unmount.
   * Duplicate singleton validation lives in the primitive layer (Phase 6);
   * the registry keeps every registration so that layer can adjudicate.
   */
  register(kind: NavigationRegionKind, element: Element): () => void {
    const entry: RegisteredRegion = {
      id: this.nextId,
      kind,
      element,
    };
    this.nextId += 1;
    this.regions.push(entry);
    let removed = false;
    return () => {
      if (removed) {
        return;
      }
      removed = true;
      this.regions = this.regions.filter((region) => region !== entry);
    };
  }

  /** Registrations in mount order. Phase 4 orders traversal by DOM document order instead. */
  getRegions(): readonly RegisteredRegion[] {
    return [...this.regions];
  }

  getRegionsByKind(kind: NavigationRegionKind): readonly RegisteredRegion[] {
    return this.regions.filter((region) => region.kind === kind);
  }

  /**
   * First registration wins (PRIMITIVES.md §4 / NAVIGATION.md §2). Later
   * duplicates are ignored by picker behavior.
   */
  getAuthoritativeRegion(
    kind: NavigationRegionKind,
  ): RegisteredRegion | undefined {
    return this.regions.find((region) => region.kind === kind);
  }

  /** Current navigation generation. Pending async focus work captures this value. */
  currentGeneration(): number {
    return this.generation;
  }

  /**
   * Invalidate pending materialize/scroll/focus work. Called on accepted
   * search change, data/category change, geometry change, reactions
   * transition and Root unmount. Completions holding a stale token MUST NOT
   * move focus or scroll.
   */
  invalidate(): void {
    this.generation += 1;
  }

  isCurrent(token: number): boolean {
    return !this.disposed && token === this.generation;
  }

  /**
   * Revive a disposed registry when its Root remounts. The registry object
   * persists across remounts (held in a ref), but the unmount cleanup
   * disposes it — without a revive, every generation-guarded focus stays
   * dead after any remount (StrictMode double-mount included). Bumps the
   * generation so pre-unmount completions cannot fire post-remount.
   */
  revive(): void {
    this.disposed = false;
    this.generation += 1;
  }

  dispose(): void {
    this.disposed = true;
    this.regions = [];
    this.singletons.clear();
    this.generation += 1;
  }

  /**
   * Claim a singleton primitive slot (PRIMITIVES.md §4 / NAVIGATION.md §2).
   * Returns true for the first claimant; later claimants are ignored by
   * picker behavior (dev throws, production warns once via
   * reportDuplicateRegion).
   */
  claimSingleton(kind: string): boolean {
    if (this.singletons.has(kind)) {
      return false;
    }
    this.singletons.add(kind);
    return true;
  }

  releaseSingleton(kind: string): void {
    this.singletons.delete(kind);
  }
}

// Duplicate singleton policy (NAVIGATION.md §2, PRIMITIVES.md §4).
//
// Duplicate compositions are unsupported in every environment; production
// merely avoids turning a configuration mistake into a hard crash. Pure
// function of the environment so tests can cover both branches.

/* global process: readonly */

export type DuplicateRegionPolicy = 'throw' | 'warn-once';

export function duplicateRegionPolicy(): DuplicateRegionPolicy {
  return process.env.NODE_ENV === 'production' ? 'warn-once' : 'throw';
}

const warnedDuplicates = new Set<string>();

export function reportDuplicateRegion(kind: string): void {
  if (duplicateRegionPolicy() === 'throw') {
    throw new Error(
      `[emoji-picker-react] Duplicate <${regionComponentName(kind)}> region: ` +
        `only one ${kind} region is supported per Root. ` +
        `See docs/v5/PRIMITIVES.md composition grammar.`,
    );
  }
  if (!warnedDuplicates.has(kind)) {
    warnedDuplicates.add(kind);
    // eslint-disable-next-line no-console
    console.warn(
      `[emoji-picker-react] Duplicate ${kind} region ignored: the first ` +
        `mounted registration stays authoritative.`,
    );
  }
}

const warnedPortals = new Set<string>();

export function reportPortalRegion(kind: NavigationRegionKind): void {
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  if (!warnedPortals.has(kind)) {
    warnedPortals.add(kind);
    // eslint-disable-next-line no-console
    console.warn(
      `[emoji-picker-react] ${kind} region is mounted outside the Root DOM ` +
        `element (portal). Portal regions are unsupported and excluded ` +
        `from arrow-key traversal.`,
    );
  }
}

function regionComponentName(kind: string): string {
  switch (kind) {
    case 'search':
      return 'Search';
    case 'categories':
      return 'CategoryNav';
    case 'grid':
      return 'List';
    case 'preview-skin-tone':
      return 'SkinTonePicker';
    case 'reactions':
      return 'Reactions';
    case 'viewport':
      return 'Viewport';
    case 'preview':
      return 'Preview';
    default:
      return kind;
  }
}

/** Test-only: reset warn-once sets between cases. */
export function __resetNavigationWarningsForTest(): void {
  warnedDuplicates.clear();
  warnedPortals.clear();
}
