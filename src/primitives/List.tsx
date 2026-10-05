import * as React from 'react';
import { cx } from 'shipstyles';

import { EmojiList } from '../components/body/EmojiList';
import { ListComponentsContext } from '../components/body/listComponents';
import { useEmojiListRef } from '../components/context/ElementRefContext';

import { filterPrimitiveProps, useMergedRefs } from './nativeProps';
import { useRootScope, useViewportScope, useViewportScrollTop } from './scope';
import type { ListProps } from './types';

// Public List primitive (docs/v5/PRIMITIVES.md §10).
//
// Managed grid region: owns category rows/groups, managed emoji buttons
// and virtualization. Accepts no consumer children; when rendered it must
// be the single List child of Viewport. `components` swaps the markup of
// emoji cells and category headers while the library keeps owning their
// behavior (consumers spread the provided props).
export const List = /* @__PURE__ */ React.forwardRef<
  HTMLUListElement,
  ListProps
>(function List(props, forwardedRef) {
  const inRoot = useRootScope('List');
  const inViewport = useViewportScope('List');
  const { components, ...rest } = props;
  const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
    'role',
  ]);
  const { className, ...restNative } = nativeProps as Omit<
    React.HTMLAttributes<HTMLUListElement>,
    'role' | 'children'
  >;

  const EmojiListRef = useEmojiListRef();
  const mergedRef = useMergedRefs(EmojiListRef, forwardedRef);
  const scrollTop = useViewportScrollTop();

  if (!inRoot || !inViewport) {
    return null;
  }

  const list = (
    <EmojiList
      scrollTop={scrollTop}
      outerRef={mergedRef}
      className={cx(className)}
      nativeProps={restNative}
    />
  );
  return components ? (
    <ListComponentsContext.Provider value={components}>
      {list}
    </ListComponentsContext.Provider>
  ) : (
    list
  );
});
