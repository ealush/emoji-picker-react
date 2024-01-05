import { cx } from 'flairup';
import * as React from 'react';
import { useState } from 'react';

import { stylesheet } from '../../Stylesheet/stylesheet';
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
    <Flex className={cx(styles.overlay)}>
      <Search />

      {isSkinToneInSearch ? <SkinTonePicker /> : null}
    </Flex>
  );
}

const styles = stylesheet.create({
  overlay: {
    padding: 'var(--epr-header-padding)',
    zIndex: 'var(--epr-header-overlay-z-index)'
  }
});

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
          className={cx(
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
        className={cx('epr-btn-clear-search', 'epr-visible-on-search-only')}
        onClick={clearSearch}
        aria-label="Clear"
        title="Clear"
      >
        <div className="epr-icn-clear-search" />
      </Button>
    </Relative>
  );
}
