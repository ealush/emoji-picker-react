import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../../Stylesheet/stylesheet';
import { useSearchDisabledConfig } from '../../../config/useConfig';
import { useIsSkinToneInSearch } from '../../../hooks/useShouldShowSkinTonePicker';
import { SearchInput } from '../../../primitives/SearchInput';
import { filterPrimitiveProps } from '../../../primitives/nativeProps';
import type { SearchProps } from '../../../primitives/types';
import Flex from '../../Layout/Flex';
import Relative from '../../Layout/Relative';
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
  // The managed region and the standalone native-input primitive share
  // the same controller, registration and accessible announcements.
  const safe = filterPrimitiveProps(
    (inputProps ?? {}) as Record<string, unknown>,
    [
      'type',
      'value',
      'defaultValue',
      'onChange',
      'autoFocus',
      'placeholder',
      'aria-controls',
    ],
  );
  const { className, ...rest } = safe;
  return (
    <Relative className={cx(styles.searchContainer)}>
      <SearchInput
        {...rest}
        className={cx(styles.search, className as string | undefined)}
        ref={inputRef}
      />
      <IcnSearch />
      <BtnClearSearch />
    </Relative>
  );
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
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
  }))();
