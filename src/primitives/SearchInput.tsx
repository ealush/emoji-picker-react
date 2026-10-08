import * as React from 'react';

import { useSearchInputRef } from '../components/context/ElementRefContext';
import {
  formatSearchResultsLabel,
  useLabels,
  useAutoFocusSearchConfig,
  useSearchDisabledConfig,
  useSearchLabelConfig,
  useSearchPlaceHolderConfig,
} from '../config/useConfig';
import { useCloseAllOpenToggles } from '../hooks/useCloseAllOpenToggles';
import { useRegisterRegion } from '../hooks/useRegisterRegion';
import { useEmojiDataState } from '../hooks/useResolvedEmojiData';
import { useSearchInputController } from '../hooks/useSearchController';
import { useVisibleSearchResultCount } from '../hooks/useSearchResults';

import {
  composeHandlers,
  filterPrimitiveProps,
  useMergedRefs,
} from './nativeProps';
import { useRootScope } from './scope';
import type {
  SearchInputComponent,
  SearchInputElement,
  SearchInputProps,
} from './types';

const hiddenStatus: React.CSSProperties = {
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  width: 1,
};

/** Native input, or a ref-forwarding design-system input. Root owns its value. */
export const SearchInput = /* @__PURE__ */ React.forwardRef<
  HTMLInputElement,
  SearchInputProps<SearchInputElement>
>(function SearchInput(props, ref) {
  const inScope = useRootScope('SearchInput');
  const disabled = useSearchDisabledConfig();
  const inputRef = useSearchInputRef();
  const mergedRef = useMergedRefs(inputRef, ref);
  const closeToggles = useCloseAllOpenToggles();
  const labels = useLabels();
  const label = useSearchLabelConfig();
  const placeholder = useSearchPlaceHolderConfig();
  const autoFocus = useAutoFocusSearchConfig();
  const resultCount = useVisibleSearchResultCount();
  const { loading, error } = useEmojiDataState();
  const controller = useSearchInputController();
  useRegisterRegion('search', inputRef, [disabled]);
  const {
    as: Input = 'input',
    onChange,
    onFocus,
    onCompositionStart,
    onCompositionEnd,
    ...rest
  } = props;
  const nativeProps = filterPrimitiveProps(rest, [
    'role',
    'type',
    'value',
    'defaultValue',
    'aria-controls',
    'children',
    'dangerouslySetInnerHTML',
  ]);
  if (!inScope || disabled) return null;
  return (
    <>
      <Input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={label}
        {...nativeProps}
        type="text"
        value={controller.value}
        data-epr-part="search-input"
        ref={mergedRef}
        onChange={composeHandlers(controller.handleChange, onChange)}
        onFocus={composeHandlers(closeToggles, onFocus)}
        onCompositionStart={composeHandlers(
          controller.handleCompositionStart,
          onCompositionStart,
        )}
        onCompositionEnd={composeHandlers(
          controller.handleCompositionEnd,
          onCompositionEnd,
        )}
      />
      {!loading && !error && resultCount !== null && (
        <span
          className="epr-status-search-results"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={hiddenStatus}
        >
          {formatSearchResultsLabel(labels, resultCount)}
        </span>
      )}
    </>
  );
}) as SearchInputComponent;
