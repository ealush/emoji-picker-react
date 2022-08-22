import * as React from 'react';
import { useFilter } from '../../hooks/useFilter';
import './Search.css';

export function Search() {
  const { onChange, searchTerm } = useFilter();

  return (
    <div className="epr-search-container">
      <input
        className="epr-search"
        type="text"
        placeholder="Search"
        onChange={event => onChange(event.target.value)}
        value={searchTerm}
      />
    </div>
  );
}
