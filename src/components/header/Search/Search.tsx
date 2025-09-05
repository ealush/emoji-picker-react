import { cx } from 'flairup';
import * as React from 'react';
import { useState } from 'react';

import { darkMode, stylesheet } from '../../../Stylesheet/stylesheet';
import {
  useAutoFocusSearchConfig,
  useSearchDisabledConfig,
  useSearchPlaceHolderConfig
} from '../../../config/useConfig';
import { useCloseAllOpenToggles } from '../../../hooks/useCloseAllOpenToggles';
import { useFilter } from '../../../hooks/useFilter';
import { useIsSkinToneInSearch } from '../../../hooks/useShouldShowSkinTonePicker';
import Flex from '../../Layout/Flex';
import Relative from '../../Layout/Relative';
import { useSearchInputRef } from '../../context/ElementRefContext';
import { SkinTonePicker } from '../SkinTonePicker/SkinTonePicker';

import { BtnClearSearch } from './BtnClearSearch';
import { CssSearch } from './CssSearch';
import { IcnSearch } from './IcnSearch';
import SVGTimes from './svg/times.svg';

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

export function Search() {
  const [inc, setInc] = useState(0);
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const SearchInputRef = useSearchInputRef();
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
        className={cx(styles.search)}
        type="text"
        aria-controls="epr-search-id"
        placeholder={placeholder}
        onChange={event => {
          setInc(inc + 1);
          onChange(event?.target?.value ?? value);
        }}
        ref={SearchInputRef}
      />
      {searchTerm ? (
        <div
          role="status"
          className={cx('epr-status-search-results', styles.visuallyHidden)}
          aria-live="polite"
          id="epr-search-id"
          aria-atomic="true"
        >
          {statusSearchResults}
        </div>
      ) : null}
      <IcnSearch />
      <BtnClearSearch />
    </Relative>
  );
}

const styles = stylesheet.create({
  overlay: {
    padding: 'var(--epr-header-padding)',
    zIndex: 'var(--epr-header-overlay-z-index)'
  },
  searchContainer: {
    '.': 'epr-search-container',
    flex: '1',
    display: 'block',
    minWidth: '0'
  },
  visuallyHidden: {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px'
  },
  search: {
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    color: 'var(--epr-search-input-text-color)',
    borderRadius: 'var(--epr-search-input-border-radius)',
    padding: 'var(--epr-search-input-padding)',
    height: 'var(--epr-search-input-height)',
    backgroundColor: 'var(--epr-search-input-bg-color)',
    border: '1px solid var(--epr-search-input-bg-color)',
    width: '100%',
    ':focus': {
      backgroundColor: 'var(--epr-search-input-bg-color-active)',
      border: '1px solid var(--epr-search-border-color)'
    },
    '::placeholder': {
      color: 'var(--epr-search-input-placeholder-color)'
    }
  },

  btnClearSearch: {
    '.': 'epr-btn-clear-search',
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
      background: 'var(--epr-hover-bg-color)'
    },
    ':focus': {
      background: 'var(--epr-hover-bg-color)'
    }
  },
  icnClearnSearch: {
    '.': 'epr-icn-clear-search',
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    height: '20px',
    width: '20px',
    backgroundImage: `url(${SVGTimes})`,
    ':hover': {
      backgroundPositionY: '-20px'
    },
    ':focus': {
      backgroundPositionY: '-20px'
    }
  },
  ...darkMode('icnClearnSearch', {
    backgroundPositionY: '-40px'
  }),
  ...darkMode('btnClearSearch', {
    ':hover > .epr-icn-clear-search': {
      backgroundPositionY: '-60px'
    }
  })
});
