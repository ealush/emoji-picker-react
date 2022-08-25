import * as React from 'react';
import { useFilter } from '../../hooks/useFilter';
import {
  useAutoFocusSearchConfig,
  useSearchPlaceHolderConfig
} from '../context/PickerConfigContext';
import './Search.css';

export function Search() {
  const placeholder = useSearchPlaceHolderConfig();
  const autoFocus = useAutoFocusSearchConfig();
  const { onChange, searchTerm } = useFilter();

  return (
    <input
      autoFocus={autoFocus}
      className="epr-search"
      type="text"
      placeholder={placeholder}
      onChange={event => onChange(event.target.value)}
      value={searchTerm}
    />
  );
}
