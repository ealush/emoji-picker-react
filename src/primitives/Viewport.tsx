import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../DomUtils/classNames';
import { stylesheet } from '../Stylesheet/stylesheet';
import { EmojiVariationPicker } from '../components/body/EmojiVariationPicker';
import { useBodyRef } from '../components/context/ElementRefContext';
import {
  useActiveEmojiState,
  useNavigationRegistry,
  useVisibleCategoriesState,
} from '../components/context/PickerContext';
import { useActiveCategory } from '../components/navigation/CategoryNavigation';
import {
  MOUSE_EVENT_SOURCE,
  useCategoriesConfig,
  usePreviewConfig,
} from '../config/useConfig';
import { useActiveCategoryScrollDetection } from '../hooks/useActiveCategoryScrollDetection';
import { useOnMouseMove } from '../hooks/useDisallowMouseMove';
import { useEmojiPreviewEvents } from '../hooks/useEmojiPreviewEvents';
import { useMouseDownHandlers } from '../hooks/useMouseDownHandlers';
import { useOnScroll } from '../hooks/useOnScroll';
import { useSingletonClaim } from '../hooks/useRegisterRegion';

import { filterPrimitiveProps, useMergedRefs } from './nativeProps';
import {
  useRootScope,
  ViewportScopeProvider,
  ViewportScrollContext,
  __resetPrimitiveWarningsForTest,
} from './scope';

// Re-exported for tests.
export { __resetPrimitiveWarningsForTest };

/* global process: readonly */

export type ViewportProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'role' | 'children' | 'dangerouslySetInnerHTML'
> & {
  /**
   * The scrolled content: one `<List>` (it may be wrapped, e.g. by a
   * styling library), optionally with `<Empty>` and `<Loading>`.
   */
  children: React.ReactNode;
};

const warnedViewportChildren = new Set<string>();

// Composition is validated by behavior, not element identity: List
// enforces being inside a Viewport (context) and being unique (grid
// region singleton). Matching `child.type === List` broke under anything
// that wraps elements — Emotion's css prop, styled(List), memo/HOCs.
// What remains is a development hint when a Viewport mounts without a
// List.
function useWarnWithoutList(): void {
  const registry = useNavigationRegistry();
  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      registry.getRegionsByKind('grid').length === 0 &&
      !warnedViewportChildren.has('missing-list')
    ) {
      warnedViewportChildren.add('missing-list');
      // eslint-disable-next-line no-console
      console.warn(
        '[emoji-picker-react] <Viewport> mounted without a <List>; it ' +
          'renders no emoji grid. See docs/v5/PRIMITIVES.md.',
      );
    }
  }, [registry]);
}

// A Viewport without a height constraint grows to the whole dataset:
// nothing scrolls, so virtualization renders every emoji (~1,900 buttons).
// A bare Root has no default height, so this is an easy first mistake.
function useWarnUnboundedViewport(
  BodyRef: React.MutableRefObject<HTMLElement | null>,
): void {
  React.useEffect(() => {
    const viewport = BodyRef.current;
    if (
      process.env.NODE_ENV === 'production' ||
      !viewport ||
      typeof ResizeObserver === 'undefined' ||
      warnedViewportChildren.has('unbounded')
    ) {
      return;
    }
    const observer = new ResizeObserver(() => {
      const unbounded =
        viewport.clientHeight > window.innerHeight * 2 &&
        viewport.scrollHeight <= viewport.clientHeight + 1;
      if (!unbounded || warnedViewportChildren.has('unbounded')) return;
      warnedViewportChildren.add('unbounded');
      observer.disconnect();
      // eslint-disable-next-line no-console
      console.warn(
        '[emoji-picker-react] <Viewport> has no height limit, so every ' +
          'emoji renders at once. Give Root a height (style={{ height: 400 }} ' +
          'or a class), or constrain the Viewport. See docs/v5/PRIMITIVES.md.',
      );
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [BodyRef]);
}

/** Test-only: reset warn-once sets between cases. */
export function __resetViewportWarningsForTest(): void {
  warnedViewportChildren.clear();
}

// Public Viewport primitive (docs/v5/PRIMITIVES.md §10).
//
// Scroll/measurement container: owns the scroll position, dismissal of
// transient toggles on scroll, and the managed variation-picker overlay.
// At most one Viewport is supported per Root. The single List child owns
// the grid; no consumer children are accepted anywhere else.
export const Viewport = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  ViewportProps
>(function Viewport(props, forwardedRef) {
  const inScope = useRootScope('Viewport');
  useSingletonClaim('viewport');
  const { children, ...rest } = props;
  const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
    'role',
  ]);
  useWarnWithoutList();

  const BodyRef = useBodyRef();
  const mergedRef = useMergedRefs(forwardedRef, BodyRef);
  const scrollTop = useOnScroll(BodyRef);
  useWarnUnboundedViewport(BodyRef);
  useMouseDownHandlers(BodyRef, MOUSE_EVENT_SOURCE.PICKER);
  useOnMouseMove();

  const { className, style, ...restNative } =
    nativeProps as React.HTMLAttributes<HTMLDivElement>;

  if (!inScope) {
    return null;
  }

  return (
    <div
      {...restNative}
      ref={mergedRef}
      data-epr-part="viewport"
      className={cx(styles.viewport, className)}
      style={style}
    >
      <ViewportScrollContext.Provider value={scrollTop}>
        <ViewportScopeProvider>
          <ViewportObservers />
          <EmojiVariationPicker />
          {children}
        </ViewportScopeProvider>
      </ViewportScrollContext.Provider>
    </div>
  );
});

function ViewportObservers() {
  // Section observation lives with the scroll container, not the tab bar:
  // tracking must continue when CategoryNav unmounts (single tab) or is
  // omitted from a composition entirely.
  const { setActiveCategory } = useActiveCategory();
  const [, setActiveEmoji] = useActiveEmojiState();
  // Hover/focus tracking for Preview and useActiveEmoji lives with the
  // scroll container too, so it works whether or not Preview is rendered.
  useEmojiPreviewEvents(usePreviewConfig().showPreview, setActiveEmoji);
  const [, setVisibleCategories] = useVisibleCategoriesState();
  const categoriesConfig = useCategoriesConfig();
  // The observer re-subscribes when the merged categories reference
  // changes (sections added/removed); the reference is stable otherwise.
  useActiveCategoryScrollDetection({
    setActiveCategory,
    setVisibleCategories,
    categories: categoriesConfig,
  });
  return null;
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    viewport: {
      '.': ClassNames.scrollBody,
      flex: '1',
      overflowY: 'scroll',
      overflowX: 'hidden',
      position: 'relative',
    },
  }))();
