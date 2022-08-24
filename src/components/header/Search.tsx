import * as React from 'react';
import { useFilter } from '../../hooks/useFilter';
import './Search.css';

export function Search() {
  const { onChange, searchTerm } = useFilter();

  return (
    <input
      className="epr-search"
      type="text"
      placeholder="Search"
      onChange={event => onChange(event.target.value)}
      value={searchTerm}
    />
  );
}
