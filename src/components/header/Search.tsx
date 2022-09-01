import * as React from 'react';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useFilter } from '../../hooks/useFilter';
import {
  useAutoFocusSearchConfig,
  useSearchPlaceHolderConfig
} from '../context/PickerConfigContext';
import Relative from '../Layout/Relative';
import './Search.css';

export function Search() {
  const { closeAllOpenToggles } = useCloseAllOpenToggles();

  const placeholder = useSearchPlaceHolderConfig();
  const autoFocus = useAutoFocusSearchConfig();
  const { onChange, searchTerm } = useFilter();

  return (
    <Relative className="epr-search-container">
      <input
        autoFocus={autoFocus}
        onFocus={closeAllOpenToggles}
        className="epr-search"
        type="text"
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
        value={searchTerm}
      />
      <div className="epr-icn-search" />
    </Relative>
  );
}
