import { scrollTo } from '../DomUtils/scrollTo';
import { usePickerMainRef } from '../components/context/ElementRefContext';
import {
  FilterState,
  useFilterRef,
  useSearchTermState
} from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiNames } from '../dataUtils/emojiSelectors';
import {
  hideElement,
  hideEmoji,
  iterateEmojiRef,
  showElement
} from '../DomUtils/emojiElementRef';
import { useRef } from 'react';
import { ClassNames } from '../DomUtils/classNames';

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
  const SearchInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useFilterRef();
  const setFilterRef = useSetFilterRef();

  const [searchTerm, setSearchTerm] = useSearchTermState();
  const PickerMainRef = usePickerMainRef();

  return {
    onChange,
    searchTerm,
    clearSearch,
    SearchInputRef
  };

  function clearSearch() {
    if (SearchInputRef.current) {
      SearchInputRef.current.value = '';
    }
    onChange('');
  }

  function onChange(nextValue: string) {
    scrollTo(PickerMainRef.current, 0);

    const filter = filterRef.current;

    if (filter?.[nextValue] || nextValue.length <= 1) {
      return applyFilterToDom(nextValue);
    }

    const longestMatch = findLongestMatch(nextValue, filter);

    if (!longestMatch) {
      // Can we even get here?
      // If so, we need to search among all emojis
      return applyFilterToDom(nextValue);
    }

    setFilterRef(current =>
      Object.assign(current, {
        [nextValue]: filterEmojiObjectByKeyword(longestMatch, nextValue)
      })
    );
    applyFilterToDom(nextValue);
  }

  // This function is the farthest from being "React" as it can be
  // It performs DOM manipulation and is not a pure function
  // But it is the most performant way to do it, at least 5 times faster than
  // react re-rendering. The reason I trust it to work correctly is because we
  // eventually do update the state, which keeps the DOM in sync - after the fact
  function applyFilterToDom(searchTerm: string): void {
    PickerMainRef.current?.classList.toggle(
      ClassNames.searchActive,
      !!searchTerm
    );

    iterateEmojiRef((element, unified) => {
      if (isEmojiFilteredBySearchTerm(unified, filterRef.current, searchTerm)) {
        hideElement(element);
        return;
      }
      showElement(element);
    });

    requestAnimationFrame(() => {
      setSearchTerm(searchTerm);
    });
  }
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
    } else {
      hideEmoji(unified);
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
