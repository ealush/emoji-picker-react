import * as React from 'react';
import { cx } from 'shipstyles';

import { darkMode, stylesheet } from '../../../Stylesheet/stylesheet';
import {
  formatSearchResultsLabel,
  useLabels,
  useAutoFocusSearchConfig,
  useSearchDisabledConfig,
  useSearchLabelConfig,
  useSearchPlaceHolderConfig,
} from '../../../config/useConfig';
import { useCloseAllOpenToggles } from '../../../hooks/useCloseAllOpenToggles';
import { useFilter } from '../../../hooks/useFilter';
import { useRegisterRegion } from '../../../hooks/useRegisterRegion';
import { useSearchInputController } from '../../../hooks/useSearchController';
import { useVisibleSearchResultCount } from '../../../hooks/useSearchResults';
import { useIsSkinToneInSearch } from '../../../hooks/useShouldShowSkinTonePicker';
import { composeHandlers, mergeRefs } from '../../../primitives/nativeProps';
import type { SearchProps } from '../../../primitives/types';
import Flex from '../../Layout/Flex';
import Relative from '../../Layout/Relative';
import { useSearchInputRef } from '../../context/ElementRefContext';
import { TIMES_ICON as SVGTimes } from '../../icons/svgIcons';
import { SkinTonePicker } from '../SkinTonePicker/SkinTonePicker';

import { BtnClearSearch } from './BtnClearSearch';
import { IcnSearch } from './IcnSearch';

export function SearchContainer({
  inputProps,
  inputRef,
}: {
  inputProps?: SearchProps['inputProps'];
  inputRef?: SearchProps['inputRef'];
} = {}) {
  const searchDisabled = useSearchDisabledConfig();

  const isSkinToneInSearch = useIsSkinToneInSearch();

  if (searchDisabled) {
    return null;
  }

  return (
    <Flex className={cx(styles.overlay)}>
      <Search inputProps={inputProps} inputRef={inputRef} />

      {isSkinToneInSearch ? <SkinTonePicker /> : null}
    </Flex>
  );
}

export function Search({
  inputProps,
  inputRef,
}: {
  inputProps?: SearchProps['inputProps'];
  inputRef?: SearchProps['inputRef'];
} = {}) {
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const SearchInputRef = useSearchInputRef();
  const placeholder = useSearchPlaceHolderConfig();
  const autoFocus = useAutoFocusSearchConfig();
  const searchLabel = useSearchLabelConfig();
  const { searchTerm } = useFilter();
  const labels = useLabels();
  const resultCount = useVisibleSearchResultCount();
  const statusSearchResults =
    resultCount === null ? '' : formatSearchResultsLabel(labels, resultCount);
  const { value, handleChange, handleCompositionStart, handleCompositionEnd } =
    useSearchInputController();
  useRegisterRegion('search', SearchInputRef);

  // Consumer input customization. `aria-label` follows the precedence
  // inputProps > searchLabel > English default; internal input handlers
  // run before consumer handlers. Input-owned keys are stripped even from
  // JavaScript callers that bypass the types.
  const {
    'aria-label': consumerAriaLabel,
    className: consumerClassName,
    onFocus: consumerOnFocus,
    onBlur: consumerOnBlur,
    onCompositionStart: consumerOnCompositionStart,
    onCompositionEnd: consumerOnCompositionEnd,
    onKeyDown: consumerOnKeyDown,
    onKeyUp: consumerOnKeyUp,
    type: _type,
    value: _value,
    defaultValue: _defaultValue,
    onChange: _onChange,
    autoFocus: _autoFocus,
    placeholder: _placeholder,
    'aria-controls': _ariaControls,
    ...safeInputProps
  } = (inputProps ?? {}) as Record<string, unknown>;
  void _type;
  void _value;
  void _defaultValue;
  void _onChange;
  void _autoFocus;
  void _placeholder;
  void _ariaControls;

  return (
    <Relative className={cx(styles.searchContainer)}>
      <input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        aria-label={(consumerAriaLabel as string | undefined) ?? searchLabel}
        onFocus={composeHandlers(closeAllOpenToggles, consumerOnFocus as never)}
        onBlur={consumerOnBlur as never}
        // Consumer classes merge with (never replace) the library class:
        // spreading inputProps after className would drop it.
        className={cx(styles.search, consumerClassName as string | undefined)}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onCompositionStart={composeHandlers(
          handleCompositionStart,
          consumerOnCompositionStart as never,
        )}
        onCompositionEnd={composeHandlers(
          handleCompositionEnd,
          consumerOnCompositionEnd as never,
        )}
        onKeyDown={consumerOnKeyDown as never}
        onKeyUp={consumerOnKeyUp as never}
        ref={mergeRefs(SearchInputRef, inputRef)}
        {...(safeInputProps as React.InputHTMLAttributes<HTMLInputElement>)}
      />
      {searchTerm ? (
        <div
          role="status"
          className={cx('epr-status-search-results', styles.visuallyHidden)}
          aria-live="polite"
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
    zIndex: 'var(--epr-header-overlay-z-index)',
  },
  searchContainer: {
    '.': 'epr-search-container',
    flex: '1',
    display: 'block',
    minWidth: '0',
  },
  visuallyHidden: {
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: '1px',
    overflow: 'hidden',
    position: 'absolute',
    whiteSpace: 'nowrap',
    width: '1px',
  },
  search: {
    outline: 'none',
    transition: 'all 0.2s ease-in-out',
    color: 'var(--epr-search-input-text-color)',
    borderRadius: 'var(--epr-search-input-border-radius)',
    padding: 'var(--epr-search-input-padding)',
    height: 'var(--epr-search-input-height)',
    backgroundColor: 'var(--epr-search-input-bg-color)',
    border: '1px solid var(--epr-search-border-color)',
    width: '100%',
    ':focus': {
      backgroundColor: 'var(--epr-search-input-bg-color-active)',
      border: '1px solid var(--epr-search-border-color-active)',
    },
    '::placeholder': {
      color: 'var(--epr-search-input-placeholder-color)',
    },
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
      background: 'var(--epr-hover-bg-color)',
    },
    ':focus': {
      background: 'var(--epr-hover-bg-color)',
    },
  },
  icnClearnSearch: {
    '.': 'epr-icn-clear-search',
    backgroundColor: 'transparent',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '20px',
    height: '20px',
    width: '20px',
    backgroundImage: `url("${SVGTimes}")`,
    ':hover': {
      backgroundPositionY: '-20px',
    },
    ':focus': {
      backgroundPositionY: '-20px',
    },
  },
  ...darkMode('icnClearnSearch', {
    backgroundPositionY: '-40px',
  }),
  ...darkMode('btnClearSearch', {
    ':hover > .epr-icn-clear-search': {
      backgroundPositionY: '-60px',
    },
  }),
});
