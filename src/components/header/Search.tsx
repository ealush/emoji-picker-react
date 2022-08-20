import * as React from 'react';
import { findLastIndex } from 'lodash';
import { createAlphaNumericEmojiIndex } from '../../dataUtils/createAlphaNumericEmojiIndex';
import { useState, useRef } from 'react';
import './Search.css';
import { DataEmoji, DataEmojis } from '../../dataUtils/DataTypes';
import { allEmojis, emojiNames } from '../../dataUtils/emojiSelectors';

export function Search() {
  const { onChange, value, emojiFilterRef } = useFilter();

  return (
    <div className="epr-search-container">
      <input
        className="epr-search"
        type="text"
        placeholder="Search"
        onChange={event => onChange(event.target.value)}
        value={value}
      />
    </div>
  );
}

function useFilter() {
  const [filter, setFilter] = useState<string[]>([]);
  const emojiFilterRef = useRef<[string, DataEmojis][]>([]);

  const value = filter[filter.length - 1] ?? '';

  return {
    onChange,
    value,
    emojiFilterRef
  };

  function onChange(nextValue: string) {
    if (nextValue.length === 0) {
      clear();
      return;
    } else if (nextValue.length === 1) {
      setFilter([nextValue]);
      const index = createAlphaNumericEmojiIndex();
      emojiFilterRef.current = [[nextValue, [...index[nextValue]] ?? []]];
      return;
    }

    const lastRelatedIndex = findLastIndex(
      emojiFilterRef.current,
      ([value]) => {
        return nextValue.includes(value);
      }
    );

    if (lastRelatedIndex === -1) {
      // We get here if the user copy-pasted something unrelated to what was in the search box.
      setFilter([nextValue]);
      emojiFilterRef.current = [
        nextValue,
        filterEmojisByKeyword(allEmojis, nextValue)
      ];
      return;
    }

    emojiFilterRef.current.splice(lastRelatedIndex + 1);
    setFilter(prev => {
      filter.splice(lastRelatedIndex + 1);
      return [...filter, nextValue];
    });

    const [lastKeyword, lastEmojis] = emojiFilterRef.current[lastRelatedIndex];

    if (lastKeyword === nextValue) {
      return;
    }

    emojiFilterRef.current.push([
      nextValue,
      filterEmojisByKeyword(lastEmojis, nextValue)
    ]);
  }

  function clear() {
    setFilter([]);
    emojiFilterRef.current = [];
  }
}

function filterEmojisByKeyword(
  emojiList: DataEmojis,
  keyword: string
): DataEmojis {
  return emojiList.filter(emoji =>
    emojiNames(emoji).some(name => name.includes(keyword))
  );
}
