import * as React from 'react';
import './Search.css';

export function Search() {
  return (
    <div className="epr-search-container">
      <input className="epr-search" type="text" placeholder="Search" />
    </div>
  );
}
