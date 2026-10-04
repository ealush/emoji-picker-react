import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../Stylesheet/stylesheet';
import { useLabels } from '../config/useConfig';
import { useEmojiDataState } from '../hooks/useResolvedEmojiData';
import { useAcceptedSearchValue } from '../hooks/useSearchController';
import { useVisibleSearchResultCount } from '../hooks/useSearchResults';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { EmptyProps } from './types';

// Public Empty primitive: renders only while an applied search shows no
// emojis. Children may be content or a render function receiving the
// search text; without children it shows `labels.searchResultsNone`.
// It is purely visual — the Search live region already announces the
// result count, so Empty carries no live-region role of its own.
export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  function Empty(props, forwardedRef) {
    const inScope = useRootScope('Empty');
    const { children, className, ...rest } = props;
    const nativeProps = filterPrimitiveProps(
      rest as Record<string, unknown>,
      ['role'],
    );
    const resultCount = useVisibleSearchResultCount();
    const search = useAcceptedSearchValue();
    const labels = useLabels();
    const { loading, error } = useEmojiDataState();

    if (!inScope || loading || error || resultCount !== 0) {
      return null;
    }

    return (
      <div
        {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
        ref={forwardedRef}
        data-epr-part="empty"
        className={cx(styles.empty, className)}
      >
        {typeof children === 'function'
          ? children({ search })
          : children ?? labels.searchResultsNone}
      </div>
    );
  },
);

const styles = stylesheet.create({
  empty: {
    '.': 'epr-empty',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--epr-horizontal-padding)',
    minHeight: 'var(--epr-emoji-fullsize)',
    color: 'var(--epr-text-color)',
    fontSize: 'var(--epr-preview-text-size)',
    textAlign: 'center',
  },
});
