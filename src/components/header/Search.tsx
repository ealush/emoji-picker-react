import * as React from 'react';
import { createAlphaNumericEmojiIndex } from '../../dataUtils/createAlphaNumericEmojiIndex';
import './Search.css';

export function Search() {
  return (
    <div className="epr-search-container">
      <input
        className="epr-search"
        type="text"
        placeholder="Search"
        onChange={onChange}
      />
    </div>
  );

  function onChange({ target: { value } }) {
    if (value.length === 0) {
      // clear active filter
    } else if (value.length === 1) {
      createAlphaNumericEmojiIndex().then(emojis => {
        console.log(emojis[value]);
      });
      // filter by first character
    } else {
      // filter by stack
    }
  }
}
