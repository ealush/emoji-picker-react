import clsx from 'clsx';
import * as React from 'react';
import { useState } from 'react';

import {
  useAutoFocusSearchConfig,
  useSearchPlaceHolderConfig
} from '../../config/useConfig';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useClearSearch, useFilter } from '../../hooks/useFilter';
import Relative from '../Layout/Relative';
import { Button } from '../atoms/Button';
import { useSearchInputRef } from '../context/ElementRefContext';

import './Search.css';

export function Search() {
  const [inc, setInc] = useState(0);
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const SearchInputRef = useSearchInputRef();
  const clearSearch = useClearSearch();
  const placeholder = useSearchPlaceHolderConfig();
  const autoFocus = useAutoFocusSearchConfig();
  const { onChange } = useFilter();

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
        placeholder={placeholder}
        onChange={event => {
          setInc(inc + 1);
          setTimeout(() => {
            onChange(event?.target?.value ?? value);
          });
        }}
        ref={SearchInputRef}
      />
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

function CssSearch({ value }: { value: undefined | string }) {
  return value ? (
    <style>{`
        .EmojiPickerReact button.epr-emoji:not([data-full-name*="${value.toLowerCase()}"]) {
          display: none;
        }
  `}</style>
  ) : null;
}
