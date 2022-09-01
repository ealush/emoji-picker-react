import { alphaNumericEmojiIndex } from '../dataUtils/alphaNumericEmojiIndex';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiNames } from '../dataUtils/emojiSelectors';
import {
  FilterState,
  useFilterRef,
  useSearchTermState
} from '../components/context/PickerContext';
import { scrollTo } from '../DomUtils/scrollTo';
import { usePickerMainRef } from '../components/context/ElementRefContext';

function useSetFilterRef() {
  const filterRef = useFilterRef();

  return function setFilter(
    setter: FilterState | ((current: FilterState) => FilterState)
  ): void {
    if (typeof setter === 'function') {
      return setFilter(setter(filterRef.current));
    }

    filterRef.current = setter;
  };
}

export function useFilter() {
  const filterRef = useFilterRef();
  const setFilterRef = useSetFilterRef();

  const [searchTerm, setSearchTerm] = useSearchTermState();
  const PickerMainRef = usePickerMainRef();

  return {
    onChange,
    searchTerm,
    clearSearch
  };

  function clearSearch() {
    setSearchTerm('');
  }

  function onChange(nextValue: string) {
    scrollTo(PickerMainRef.current, 0);
    setSearchTerm(nextValue);
    const filter = filterRef.current;

    if (nextValue.length === 0) {
      // setFilter(null);
      return;
    } else if (nextValue.length === 1) {
      const index = alphaNumericEmojiIndex;
      setFilterRef(current => ({
        ...current,
        [nextValue]: index[nextValue]
      }));
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

    setFilterRef(current => ({
      ...current,
      [nextValue]: filterEmojiObjectByKeyword(longestMatch, nextValue)
    }));
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
  const { current: filter } = useFilterRef();
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
