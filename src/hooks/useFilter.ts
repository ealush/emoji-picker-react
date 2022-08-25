import { createAlphaNumericEmojiIndex } from '../dataUtils/createAlphaNumericEmojiIndex';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiNames } from '../dataUtils/emojiSelectors';
import {
  FilterState,
  useFilterState,
  useSearchTermState
} from '../components/contextProvider/PickerContextProvider';

export function useFilter() {
  const [filter = {}, setFilter] = useFilterState();
  const [searchTerm, setSearchTerm] = useSearchTermState();

  return {
    onChange,
    searchTerm
  };

  function onChange(nextValue: string) {
    setSearchTerm(nextValue);

    if (nextValue.length === 0) {
      // setFilter(null);
      return;
    } else if (nextValue.length === 1) {
      const index = createAlphaNumericEmojiIndex();
      setFilter({
        ...filter,
        [nextValue]: index[nextValue]
      });
      return;
    }

    if (filter?.[nextValue]) {
      return;
    }

    const longestMatch = findLongestMatch(nextValue, filter);

    if (!longestMatch) {
      // Can we even get here?
      // If so, we need to search among all emojis
      return;
    }

    setFilter({
      ...filter,
      [nextValue]: filterEmojiObjectByKeyword(longestMatch, nextValue)
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

function hasMatch(emoji: DataEmoji, keyword: string): boolean {
  return emojiNames(emoji).some(name => name.includes(keyword));
}

export function useIsEmojiFiltered(unified: string): boolean {
  const [filter] = useFilterState();
  const [searchTerm] = useSearchTermState();

  return isEmojiFilteredBySearchTerm(unified, filter, searchTerm);
}

export function isEmojiFilteredBySearchTerm(
  unified: string,
  filter: FilterState,
  searchTerm: string
): boolean {
  if (!filter || !searchTerm) {
    return false;
  }

  return !filter[searchTerm]?.[unified];
}

export type FilterDict = Record<string, DataEmoji>;

function findLongestMatch(
  keyword: string,
  dict: Record<string, FilterDict> | null
): FilterDict | null {
  if (!dict) {
    return null;
  }

  if (dict[keyword]) {
    return dict[keyword];
  }

  const longestMatchingKey = Object.keys(dict)
    .sort((a, b) => b.length - a.length)
    .find(key => keyword.includes(key));

  if (longestMatchingKey) {
    return dict[longestMatchingKey];
  }

  return null;
}
