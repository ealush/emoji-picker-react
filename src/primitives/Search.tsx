import * as React from 'react';

import { SearchContainer } from '../components/header/Search/Search';
import { useSearchDisabledConfig } from '../config/useConfig';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { SearchProps } from './types';

// Public Search primitive (docs/v5/PRIMITIVES.md §9).
//
// Managed search region: input, status live region, clear control, search
// icon, and the search-position skin-tone control when configured. Renders
// and registers nothing when search is disabled. Ref addresses the region
// wrapper; `inputRef` addresses the input itself.
export const Search = React.forwardRef<HTMLDivElement, SearchProps>(
  function Search(props, forwardedRef) {
    const inScope = useRootScope('Search');
    const searchDisabled = useSearchDisabledConfig();
    const { inputProps, inputRef, ...rest } = props;
    const nativeProps = filterPrimitiveProps(
      rest as Record<string, unknown>,
      ['role'],
    );

    // Out-of-scope (production only; development throws above) renders
    // null after a warn-once: continuing would crash with a TypeError.
    if (!inScope || searchDisabled) {
      return null;
    }

    return (
      <div
        {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
        ref={forwardedRef}
        data-epr-part="search"
      >
        <SearchContainer inputProps={inputProps} inputRef={inputRef} />
      </div>
    );
  },
);
