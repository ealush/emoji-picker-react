import * as React from 'react';
import { useState } from 'react';

import { asSelectors, ClassNames, clsx } from '../../DomUtils/classNames';
import {
  useAutoFocusSearchConfig,
  useSearchDisabledConfig,
  useSearchPlaceHolderConfig
} from '../../config/useConfig';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import {
  getNormalizedSearchTerm,
  useClearSearch,
  useFilter
} from '../../hooks/useFilter';
import { useIsSkinToneInSearch } from '../../hooks/useShouldShowSkinTonePicker';
import Flex from '../Layout/Flex';
import Relative from '../Layout/Relative';
import { Button } from '../atoms/Button';
import { useSearchInputRef } from '../context/ElementRefContext';

import './Search.css';
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
  const { searchResultsCount, searchTerm, onChange } = useFilter();

  const input = SearchInputRef?.current;
  const value = input?.value;
  const statusSearchResults = `${searchResultsCount} result${searchResultsCount > 1 ? 's' : ''} found. Use up and down arrow keys to navigate.`;
  const statusNoSearchResults = 'No results found';

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
        aria-controls='epr-search-id'
        placeholder={placeholder}
        onChange={event => {
          setInc(inc + 1);
          setTimeout(() => {
            onChange(event?.target?.value ?? value);
          });
        }}
        ref={SearchInputRef}
      />
      {searchTerm && (
        <div
          role='status'
          className={clsx('epr-status-search-results', 'epr-status-visually-hidden')}
          aria-live='polite'
          id='epr-search-id'
          aria-atomic='true'
        >
          {searchResultsCount > 0 ? statusSearchResults : statusNoSearchResults}
        </div>
      )}
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

const CSS_SEARCH_SELECTOR = `${asSelectors(
  ClassNames.emojiPicker
)} ${asSelectors(ClassNames.emojiList)}`;

function CssSearch({ value }: { value: undefined | string }) {
  if (!value) {
    return null;
  }

  const searchQuery = `button[data-full-name*="${getNormalizedSearchTerm(
    value
  )}"]`;

  return (
    <style>{`
        ${CSS_SEARCH_SELECTOR} ${asSelectors(
      ClassNames.category
    )}:not(:has(${searchQuery})) {
        display: none;
      }

        ${CSS_SEARCH_SELECTOR} button${asSelectors(
      ClassNames.emoji
    )}:not(${searchQuery}) {
        display: none;
      }
  `}</style>
  );
}
