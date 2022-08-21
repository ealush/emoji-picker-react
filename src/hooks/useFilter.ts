import { findLastIndex } from 'lodash';
import { createAlphaNumericEmojiIndex } from '../dataUtils/createAlphaNumericEmojiIndex';
import { DataEmoji, DataEmojis } from '../dataUtils/DataTypes';
import {
  allEmojis,
  emojiNames,
  emojiUnified
} from '../dataUtils/emojiSelectors';
import { useFilterState } from '../components/contextProvider/PickerContextProvider';

export function useFilter() {
  const [filter, setFilter] = useFilterState();

  return {
    onChange
  };

  function onChange(nextValue: string) {
    if (nextValue.length === 0) {
      setFilter([]);
      return;
    } else if (nextValue.length === 1) {
      const index = createAlphaNumericEmojiIndex();
      setFilter([[nextValue, listToObject(Array.from(index[nextValue]))]]);
      return;
    }

    const lastRelatedIndex = findLastIndex(filter, ([value]) => {
      return nextValue.includes(value);
    });

    if (lastRelatedIndex === -1) {
      // We get here if the user copy-pasted something unrelated to what was in the search box.
      setFilter([[nextValue, filterEmojiListByKeyword(allEmojis, nextValue)]]);
      return;
    }

    const [lastKeyword, lastEmojis] = filter[lastRelatedIndex];

    if (lastKeyword === nextValue) {
      if (filter.length !== nextValue.length) {
        setFilter(current => current.slice(0, lastRelatedIndex + 1));
      }
      return;
    }

    setFilter(current => {
      current.splice(lastRelatedIndex + 1);

      return current.concat([
        [nextValue, filterEmojiObjectByKeyword(lastEmojis, nextValue)]
      ]);
    });
  }
}

function filterEmojiObjectByKeyword(
  emojis: FilterDict,
  keyword: string
): FilterDict {
  let filtered: FilterDict = {};

  for (const unified in emojis) {
    const emoji = emojis[unified];

    if (hasMatch(emoji, keyword)) {
      filtered[unified] = emoji;
    }
  }

  return filtered;
}

function listToObject(list: DataEmojis): FilterDict {
  return list.reduce((dict, emoji) => {
    dict[emojiUnified(emoji)] = emoji;
    return dict;
  }, {} as FilterDict);
}

function filterEmojiListByKeyword(
  emojiList: DataEmojis,
  keyword: string
): FilterDict {
  return emojiList.reduce((dict, emoji) => {
    if (hasMatch(emoji, keyword)) {
      dict[emojiUnified(emoji)] = emoji;
    }

    return dict;
  }, {} as FilterDict);
}

function hasMatch(emoji: DataEmoji, keyword: string): boolean {
  return emojiNames(emoji).some(name => name.includes(keyword));
}

export function useIsEmojiFiltered(unified: string): boolean {
  const [filter] = useFilterState();

  const last = filter[filter.length - 1];

  if (!last) {
    return false;
  }

  return !last[1][unified];
}

export type FilterDict = Record<string, DataEmoji>;
