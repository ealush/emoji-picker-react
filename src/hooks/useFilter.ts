import { scrollTo } from '../DomUtils/scrollTo';
import {
  usePickerMainRef,
  useSearchInputRef,
} from '../components/context/ElementRefContext';
import {
  FilterState,
  useFilterRef,
  useSearchTermState,
} from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiNames } from '../dataUtils/emojiSelectors';

import { useFocusSearchInput } from './useFocus';
import { useSearchResultsConfig } from '../config/useConfig';

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

export function useClearSearch() {
  const applySearch = useApplySearch();
  const SearchInputRef = useSearchInputRef();
  const focusSearchInput = useFocusSearchInput();

  return function clearSearch() {
    if (SearchInputRef.current) {
      SearchInputRef.current.value = '';
    }

    applySearch('');
    focusSearchInput();
  };
}

export function useAppendSearch() {
  const SearchInputRef = useSearchInputRef();
  const applySearch = useApplySearch();

  return function appendSearch(str: string) {
    if (SearchInputRef.current) {
      SearchInputRef.current.value = `${SearchInputRef.current.value}${str}`;
      applySearch(getNormalizedSearchTerm(SearchInputRef.current.value));
    } else {
      applySearch(getNormalizedSearchTerm(str));
    }
  };
}

export function useFilter() {
  const SearchInputRef = useSearchInputRef();
  const filterRef = useFilterRef();
  const setFilterRef = useSetFilterRef();
  const applySearch = useApplySearch();

  const [searchTerm] = useSearchTermState();
  const statusSearchResults = getStatusSearchResults(filterRef.current, searchTerm);

  return {
    onChange,
    searchTerm,
    SearchInputRef,
    statusSearchResults,
  };

  function onChange(inputValue: string) {
    const filter = filterRef.current;

    const nextValue = inputValue.toLowerCase();

    if (filter?.[nextValue] || nextValue.length <= 1) {
      return applySearch(nextValue);
    }

    const longestMatch = findLongestMatch(nextValue, filter);

    if (!longestMatch) {
      // Can we even get here?
      // If so, we need to search among all emojis
      return applySearch(nextValue);
    }

    setFilterRef((current) =>
      Object.assign(current, {
        [nextValue]: filterEmojiObjectByKeyword(longestMatch, nextValue),
      })
    );
    applySearch(nextValue);
  }
}

function useApplySearch() {
  const [, setSearchTerm] = useSearchTermState();
  const PickerMainRef = usePickerMainRef();

  return function applySearch(searchTerm: string) {
    requestAnimationFrame(() => {
      setSearchTerm(searchTerm ? searchTerm?.toLowerCase() : searchTerm).then(
        () => {
          scrollTo(PickerMainRef.current, 0);
        }
      );
    });
  };
}

function filterEmojiObjectByKeyword(
  emojis: FilterDict,
  keyword: string
): FilterDict {
  const filtered: FilterDict = {};

  for (const unified in emojis) {
    const emoji = emojis[unified];

    if (hasMatch(emoji, keyword)) {
      filtered[unified] = emoji;
    }
  }

  return filtered;
}

function hasMatch(emoji: DataEmoji, keyword: string): boolean {
  return emojiNames(emoji).some((name) => name.includes(keyword));
}

export function useIsEmojiFiltered(): (unified: string) => boolean {
  const { current: filter } = useFilterRef();
  const [searchTerm] = useSearchTermState();

  return (unified) => isEmojiFilteredBySearchTerm(unified, filter, searchTerm);
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
    .find((key) => keyword.includes(key));

  if (longestMatchingKey) {
    return dict[longestMatchingKey];
  }

  return null;
}

export function getNormalizedSearchTerm(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.trim().toLowerCase();
}

function getStatusSearchResults(filterState: FilterState, searchTerm: string): string {
  if (!filterState?.[searchTerm]) return '';

  const searchResultsCount = Object.entries(filterState?.[searchTerm])?.length || 0;
  return useSearchResultsConfig(searchResultsCount);
}
