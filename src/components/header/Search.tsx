import * as React from 'react';
import { useFilter } from '../../hooks/useFilter';
import { useSearchPlaceHolderConfig } from '../context/PickerConfigContext';
import './Search.css';

export function Search() {
  const placeholder = useSearchPlaceHolderConfig();
  const { onChange, searchTerm } = useFilter();

  return (
    <input
      className="epr-search"
      type="text"
      placeholder={placeholder}
      onChange={event => onChange(event.target.value)}
      value={searchTerm}
    />
  );
}
