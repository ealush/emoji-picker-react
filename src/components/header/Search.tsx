import * as React from 'react';

import {
  useAutoFocusSearchConfig,
  useSearchPlaceHolderConfig
} from '../../config/useConfig';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useClearSearch, useFilter } from '../../hooks/useFilter';
import Relative from '../Layout/Relative';
import { useSearchInputRef } from '../context/ElementRefContext';

import './Search.css';
import clsx from 'clsx';

export function Search() {
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const SearchInputRef = useSearchInputRef();
  const clearSearch = useClearSearch();
  const placeholder = useSearchPlaceHolderConfig();
  const autoFocus = useAutoFocusSearchConfig();
  const { onChange } = useFilter();

  return (
    <Relative className="epr-search-container">
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        aria-label={'Type to search for an emoji'}
        onFocus={closeAllOpenToggles}
        className="epr-search"
        type="text"
        placeholder={placeholder}
        onChange={event => {
          setTimeout(() => {
            onChange(event.target.value);
          });
        }}
        ref={SearchInputRef}
      />
      <div className="epr-icn-search" />
      <button
        className={clsx('epr-btn-clear-search', 'epr-visible-on-search-only')}
        onClick={clearSearch}
      />
    </Relative>
  );
}
