import * as React from 'react';

import { SearchContainer } from '../components/header/Search/Search';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { SearchProps } from './types';

// Public Search primitive.
//
// Managed search region: input, status live region, clear control and icon.
// Additional controls are supplied as children. Ref addresses the region
// wrapper; `inputRef` addresses the input itself.
export const Search = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  SearchProps
>(function Search(props, forwardedRef) {
  const inScope = useRootScope('Search');
  const { children, inputProps, inputRef, ...rest } = props;
  const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
    'role',
  ]);

  // Out-of-scope (production only; development throws above) renders
  // null after a warn-once: continuing would crash with a TypeError.
  if (!inScope) {
    return null;
  }

  return (
    <div
      {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
      ref={forwardedRef}
      data-epr-part="search"
    >
      <SearchContainer inputProps={inputProps} inputRef={inputRef}>
        {children}
      </SearchContainer>
    </div>
  );
});
