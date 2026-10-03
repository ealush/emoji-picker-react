import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../DomUtils/classNames';
import { stylesheet } from '../Stylesheet/stylesheet';
import { EmojiVariationPicker } from '../components/body/EmojiVariationPicker';
import { useBodyRef } from '../components/context/ElementRefContext';
import {
  useActiveEmojiState,
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

import { Empty } from './Empty';
import { List } from './List';
import { filterPrimitiveProps, mergeRefs } from './nativeProps';
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
  'role' | 'children'
> & {
  /** Exactly one `<List>`, optionally accompanied by `<Empty>`. */
  children: React.ReactElement | React.ReactElement[];
};

const warnedViewportChildren = new Set<string>();

function assertSingleListChild(children: React.ReactNode): void {
  const elements = React.Children.toArray(children);
  const valid =
    elements.length > 0 &&
    elements.every(
      (child) =>
        React.isValidElement(child) &&
        (child.type === List || child.type === Empty),
    ) &&
    elements.filter(
      (child) => React.isValidElement(child) && child.type === List,
    ).length === 1;
  if (valid) {
    return;
  }
  if (process.env.NODE_ENV === 'production') {
    if (!warnedViewportChildren.has('viewport')) {
      warnedViewportChildren.add('viewport');
      // eslint-disable-next-line no-console
      console.warn(
        '[emoji-picker-react] <Viewport> requires exactly one direct ' +
          '<List> child (plus optional <Empty>); rendering children as-is.',
      );
    }
    return;
  }
  throw new Error(
    '[emoji-picker-react] <Viewport> requires exactly one direct <List> ' +
      'child (plus optional <Empty>). See docs/v5/PRIMITIVES.md ' +
      'composition grammar.',
  );
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
export const Viewport = React.forwardRef<HTMLDivElement, ViewportProps>(
  function Viewport(props, forwardedRef) {
    const inScope = useRootScope('Viewport');
    useSingletonClaim('viewport');
    const { children, ...rest } = props;
    const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
      'role',
    ]);
    assertSingleListChild(children);

    const BodyRef = useBodyRef();
    const scrollTop = useOnScroll(BodyRef);
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
        ref={mergeRefs(forwardedRef, BodyRef)}
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
  },
);

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

const styles = stylesheet.create({
  viewport: {
    '.': ClassNames.scrollBody,
    flex: '1',
    overflowY: 'scroll',
    overflowX: 'hidden',
    position: 'relative',
  },
});
