import * as React from 'react';
import { useState } from 'react';

import { clsx } from '../../DomUtils/classNames';
import {
  useAutoFocusSearchConfig,
  useSearchDisabledConfig,
  useSearchPlaceHolderConfig
} from '../../config/useConfig';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useClearSearch, useFilter } from '../../hooks/useFilter';
import { useIsSkinToneInSearch } from '../../hooks/useShouldShowSkinTonePicker';
import Flex from '../Layout/Flex';
import Relative from '../Layout/Relative';
import { Button } from '../atoms/Button';
import { useSearchInputRef } from '../context/ElementRefContext';

import './Search.css';
import { CssSearch } from './CssSearch';
import { SkinTonePicker } from './SkinTonePicker';

export function SearchContainer() {
  const searchDisabled = useSearchDisabledConfig();

  const isSkinToneInSearch = useIsSkinToneInSearch();

  if (searchDisabled) {
    return null;
  }

  return (
    <Flex className="epr-header-overlay">
      <Search />

      {isSkinToneInSearch ? <SkinTonePicker /> : null}
    </Flex>
  );
}

export function Search() {
  const [inc, setInc] = useState(0);
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const SearchInputRef = useSearchInputRef();
  const clearSearch = useClearSearch();
  const placeholder = useSearchPlaceHolderConfig();
  const autoFocus = useAutoFocusSearchConfig();
  const { statusSearchResults, searchTerm, onChange } = useFilter();

  const input = SearchInputRef?.current;
  const value = input?.value;

  return (
    <Relative className="epr-search-container">
      <CssSearch value={value} />
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        aria-label={'Type to search for an emoji'}
        onFocus={closeAllOpenToggles}
        className="epr-search"
        type="text"
        aria-controls="epr-search-id"
        placeholder={placeholder}
        onChange={event => {
          setInc(inc + 1);
          setTimeout(() => {
            onChange(event?.target?.value ?? value);
          });
        }}
        ref={SearchInputRef}
      />
      {searchTerm ? (
        <div
          role="status"
          className={clsx(
            'epr-status-search-results',
            'epr-status-visually-hidden'
          )}
          aria-live="polite"
          id="epr-search-id"
          aria-atomic="true"
        >
          {statusSearchResults}
        </div>
      ) : null}
      <div className="epr-icn-search" />
      <Button
        className={clsx('epr-btn-clear-search', 'epr-visible-on-search-only')}
        onClick={clearSearch}
      >
        <div className="epr-icn-clear-search" />
      </Button>
    </Relative>
  );
}
