import { alphaNumericEmojiIndex } from '../dataUtils/alphaNumericEmojiIndex';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiNames } from '../dataUtils/emojiSelectors';
import {
  FilterState,
  useFilterState,
  usePickerMainRef,
  useSearchTermState
} from '../components/context/PickerContext';
import { scrollTo } from '../DomUtils/scrollTo';

export function useFilter() {
  const [filter = {}, setFilter] = useFilterState();
  const [searchTerm, setSearchTerm] = useSearchTermState();
  const PickerMainRef = usePickerMainRef();

  return {
    onChange,
    searchTerm
  };

  function onChange(nextValue: string) {
    scrollTo(PickerMainRef.current, 0);
    setSearchTerm(nextValue);

    if (nextValue.length === 0) {
      // setFilter(null);
      return;
    } else if (nextValue.length === 1) {
      const index = alphaNumericEmojiIndex;
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

export function useIsEmojiFiltered(): (unified: string) => boolean {
  const [filter] = useFilterState();
  const [searchTerm] = useSearchTermState();

  return unified => isEmojiFilteredBySearchTerm(unified, filter, searchTerm);
}

function isEmojiFilteredBySearchTerm(
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
