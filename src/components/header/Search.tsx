import { cx } from 'flairup';
import * as React from 'react';
import { useState } from 'react';

import { clsx } from '../../DomUtils/classNames';
import { sheet } from '../../DomUtils/stylesheet';
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

import { CssSearch } from './CssSearch';
import { SkinTonePicker } from './SkinTonePicker';
import magnifier from './svg/magnifier.svg';
import times from './svg/times.svg';

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
    <Relative className={cx(styles.searchContainer)}>
      <CssSearch value={value} />
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        aria-label={'Type to search for an emoji'}
        onFocus={closeAllOpenToggles}
        className={cx(styles.searchInput)}
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
          className={cx(styles.searchResultsVisuallyHidden)}
          aria-live="polite"
          id="epr-search-id"
          aria-atomic="true"
        >
          {statusSearchResults}
        </div>
      ) : null}
      <div className={cx(styles.icnSearch)} />
      <Button
        className={clsx(
          cx(styles.btnClearSearch),
          'epr-visible-on-search-only'
        )}
        onClick={clearSearch}
      >
        <div className={cx(styles.icnClearSearch)} />
      </Button>
    </Relative>
  );
}

const styles = sheet.create({
  searchContainer: {
    flex: 1,
    display: 'block',
    minWidth: 0
  },
  searchResultsVisuallyHidden: {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px'
  },
  searchInput: {
    '::placeholder': {
      color: 'var(--epr-search-input-placeholder-color)'
    },
    ':focus': {
      backgroundColor: 'var(--epr-search-input-bg-color-active)',
      border: '1px solid var(--epr-search-border-color)'
    },
    backgroundColor: 'var(--epr-search-input-bg-color)',
    border: '1px solid var(--epr-search-input-bg-color)',
    borderRadius: 'var(--epr-search-input-border-radius)',
    color: 'var(--epr-search-input-text-color)',
    height: 'var(--epr-search-input-height)',
    outline: 'none',
    padding: 'var(--epr-search-input-padding)',
    transition: 'all 0.2s ease-in-out',
    width: '100%'
  },
  icnSearch: {
    content: '',
    position: 'absolute',
    top: '50%',
    left: 'var(--epr-search-bar-inner-padding)',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    backgroundImage: `url(${magnifier})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0 0',
    backgroundSize: '20px'
  },
  btnClearSearch: {
    position: 'absolute',
    right: 'var(--epr-search-bar-inner-padding)',
    height: '30px',
    width: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '0',
    borderRadius: '50%',
    ':hover': {
      background: 'var(--epr-hover-bg-color)',
      ' > epr-icn-clear-search': {
        background: 'red'
      }
    },
    ':focus': {
      background: 'var(--epr-hover-bg-color)'
    }
  },
  icnClearSearch: {
    '.': 'epr-icn-clear-search',
    backgroundImage: `url(${times})`,
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    height: '20px',
    width: '20px'
  }
});
