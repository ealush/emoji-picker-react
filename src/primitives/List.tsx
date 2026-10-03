import * as React from 'react';
import { cx } from 'shipstyles';

import { EmojiList } from '../components/body/EmojiList';
import { useEmojiListRef } from '../components/context/ElementRefContext';

import { filterPrimitiveProps, mergeRefs } from './nativeProps';
import { useRootScope, useViewportScope, useViewportScrollTop } from './scope';
import type { ListProps } from './types';

// Public List primitive (docs/v5/PRIMITIVES.md §10).
//
// Managed grid region: owns category rows/groups, managed emoji buttons
// and virtualization. Accepts no consumer children; when rendered it must
// be the single direct child of Viewport.
export const List = React.forwardRef<HTMLUListElement, ListProps>(
  function List(props, forwardedRef) {
    const inRoot = useRootScope('List');
    const inViewport = useViewportScope('List');
    const nativeProps = filterPrimitiveProps(
      props as Record<string, unknown>,
      ['role'],
    );
    const { className, ...restNative } = nativeProps as Omit<
      React.HTMLAttributes<HTMLUListElement>,
      'role' | 'children'
    >;

    const EmojiListRef = useEmojiListRef();
    const scrollTop = useViewportScrollTop();

    if (!inRoot || !inViewport) {
      return null;
    }

    return (
      <EmojiList
        scrollTop={scrollTop}
        outerRef={mergeRefs(EmojiListRef, forwardedRef)}
        className={cx(className)}
        nativeProps={restNative}
      />
    );
  },
);
