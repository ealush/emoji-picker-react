import * as React from 'react';
import { findLastIndex } from 'lodash';
import { createAlphaNumericEmojiIndex } from '../dataUtils/createAlphaNumericEmojiIndex';
import { useState, useRef } from 'react';
import { DataEmoji, DataEmojis } from '../dataUtils/DataTypes';
import { allEmojis, emojiNames } from '../dataUtils/emojiSelectors';

export function useFilter() {
  const emojiFilterRef = useRef<[string, DataEmojis][]>([]);

  const [value] =
    emojiFilterRef.current[emojiFilterRef.current.length - 1] ?? [];

  return {
    onChange,
    emojiFilterRef
  };

  function setFilter(nextFilter: [string, DataEmojis][]) {
    emojiFilterRef.current = nextFilter;
  }

  function onChange(nextValue: string) {
    if (nextValue.length === 0) {
      setFilter([]);
      return;
    } else if (nextValue.length === 1) {
      const index = createAlphaNumericEmojiIndex();
      setFilter([[nextValue, [...index[nextValue]] ?? []]]);
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
      setFilter([(nextValue, filterEmojisByKeyword(allEmojis, nextValue))]);
      return;
    }

    emojiFilterRef.current.splice(lastRelatedIndex + 1);

    const [lastKeyword, lastEmojis] = emojiFilterRef.current[lastRelatedIndex];

    if (lastKeyword === nextValue) {
      return;
    }

    setFilter(
      emojiFilterRef.current.concat([
        [nextValue, filterEmojisByKeyword(lastEmojis, nextValue)]
      ])
    );
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
