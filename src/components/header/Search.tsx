import { cx } from 'flairup';
import * as React from 'react';
import { useState } from 'react';

import {
  commonInteractionStyles,
  stylesheet
} from '../../Stylesheet/stylesheet';
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
import SVGMagnifier from './svg/magnifier.svg';
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
        className={cx(styles.search)}
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
          className={cx('epr-status-search-results', styles.visuallyHidden)}
          aria-live="polite"
          id="epr-search-id"
          aria-atomic="true"
        >
          {statusSearchResults}
        </div>
      ) : null}
      <div className={cx(styles.icnSearch)} />
      <Button
        className={cx(
          styles.btnClearSearch,
          commonInteractionStyles.visibleOnSearchOnly
        )}
        onClick={clearSearch}
        aria-label="Clear"
        title="Clear"
      >
        <div className={cx(styles.icnClearnSearch)} />
      </Button>
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
  icnSearch: {
    '.': 'epr-icn-search',
    content: '',
    position: 'absolute',
    top: '50%',
    left: 'var(--epr-search-bar-inner-padding)',
    transform: 'translateY(-50%)',
    width: '20px',
    height: '20px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '0 0',
    backgroundSize: '20px',
    backgroundImage: `url(${SVGMagnifier})`
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
  '.epr-dark-theme': {
    icnSearch: {
      backgroundPositionY: '-20px'
    },
    icnClearnSearch: {
      backgroundPositionY: '-40px'
    },
    btnClearSearch: {
      ':hover > .epr-icn-clear-search': {
        backgroundPositionY: '-60px'
      }
    }
  },
  '.epr-auto-theme': {
    icnSearch: {
      '@media (prefers-color-scheme: dark)': {
        backgroundPositionY: '-20px'
      }
    },
    icnClearnSearch: {
      '@media (prefers-color-scheme: dark)': {
        backgroundPositionY: '-40px'
      }
    },
    btnClearSearch: {
      '@media (prefers-color-scheme: dark)': {
        // @ts-ignore
        ':hover > .epr-icn-clear-search': {
          backgroundPositionY: '-60px'
        }
      }
    }
  }
});
