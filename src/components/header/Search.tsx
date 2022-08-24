import * as React from 'react';
import { useFilter } from '../../hooks/useFilter';
import './Search.css';

type Props = {
  emojiSearchRef:any
}

export function Search ({emojiSearchRef}:Props) {
  const { onChange, searchTerm } = useFilter();

  return (
    <div className="epr-search-container">
      <input
        className="epr-search"
        type="text"
        placeholder="Search"
        onChange={event => onChange(event.target.value)}
        value={searchTerm}
        ref={emojiSearchRef}
      />
    </div>
  );
}
