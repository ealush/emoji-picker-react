import { createAlphaNumericEmojiIndex } from '../dataUtils/createAlphaNumericEmojiIndex';
import { DataEmoji, DataEmojis } from '../dataUtils/DataTypes';
import {
  allEmojis,
  emojiNames,
  emojiUnified
} from '../dataUtils/emojiSelectors';
import {
  useFilterState,
  useSearchTermState
} from '../components/contextProvider/PickerContextProvider';

export function useFilter() {
  const [filter, setFilter] = useFilterState();
  const [searchTerm, setSearchTerm] = useSearchTermState();

  return {
    onChange,
    searchTerm
  };

  function onChange(nextValue: string) {
    setSearchTerm(nextValue);

    if (nextValue.length === 0) {
      setFilter(null);
      return;
    } else if (nextValue.length === 1) {
      const index = createAlphaNumericEmojiIndex();
      setFilter({
        [nextValue]: index[nextValue]
      });
      return;
    }

    const longestMatch = findLongestMatch(nextValue, filter);

    if (!longestMatch) {
      setFilter({
        [nextValue]: filterEmojiListByKeyword(allEmojis, nextValue)
      });
      return;
    }

    setFilter({
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
  const [searchTerm] = useSearchTermState();

  if (!filter) {
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
