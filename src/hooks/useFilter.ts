import * as React from 'react';

import { scrollTo } from '../DomUtils/scrollTo';
import { usePickerMainRef } from '../components/context/ElementRefContext';
import {
  FilterState,
  useFilterQueryOrderRef,
  useFilterRef,
  useNavigationRegistry,
  useSearchTermState,
} from '../components/context/PickerContext';
import { usePickerDataContext } from '../components/context/PickerDataContext';
import { normalizeQuery } from '../data-core/prepare';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiNames } from '../dataUtils/emojiUtils';

/**
 * Bound on cached per-query filter dicts per Root. Dicts are cheaply
 * rebuilt from the shared memoized core, so a long typing session keeps
 * only a recent window instead of growing without bound.
 */
const MAX_FILTER_QUERIES = 50;

function useSetFilterRef() {
  const filterRef = useFilterRef();
  const orderRef = useFilterQueryOrderRef();

  return function setFilter(nextValue: string, dict: FilterDict): void {
    // Copy-on-write into a fresh object: the ref never aliases shared
    // snapshot state, and spread defines own properties (no prototype
    // mutation for adversarial queries such as "__proto__").
    const next: FilterState = { ...filterRef.current, [nextValue]: dict };
    const order = orderRef.current;
    if (!order.includes(nextValue)) {
      order.push(nextValue);
    }
    while (order.length > MAX_FILTER_QUERIES) {
      const oldest = order.shift() as string;
      delete next[oldest];
    }
    filterRef.current = next;
  };
}

export function useFilter() {
  const filterRef = useFilterRef();
  const setFilterRef = useSetFilterRef();
  const applySearch = useApplySearch();
  const { queryFilterDict } = usePickerDataContext();
  // Managed SearchInput owns announcements; this hook only applies filters.
  return { onChange };

  function onChange(inputValue: string) {
    const filter = filterRef.current;

    // Normalized derived query: the visible/callback value
    // stays raw, filtering folds case and trims surrounding whitespace.
    // Matching itself runs in the single shared prepared core.
    const nextValue = normalizeQuery(inputValue);

    if (!nextValue) {
      return applySearch(nextValue);
    }
    if (hasOwnQuery(filter, nextValue)) {
      return applySearch(nextValue);
    }

    setFilterRef(nextValue, queryFilterDict(nextValue));
    applySearch(nextValue);
  }
}

function hasOwnQuery(filter: FilterState, query: string): boolean {
  return Object.prototype.hasOwnProperty.call(filter, query);
}

function useApplySearch() {
  const [, setSearchTerm] = useSearchTermState();
  const PickerMainRef = usePickerMainRef();
  const registry = useNavigationRegistry();
  // A search frame pending at unmount must not schedule post-unmount
  // debounce work (the debounced state also clears its own timer, so
  // both stages of the pipeline die with the Root).
  const mountedRef = React.useRef(true);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return function applySearch(searchTerm: string) {
    // A new accepted filter obsoletes pending grid materialize/focus work.
    registry.invalidate();
    // The scroll back to the top lands after the debounce; navigation in
    // the meantime (e.g. a category tab clicked right after clearing the
    // search) supersedes it instead of being yanked back to the top.
    const token = registry.currentGeneration();
    requestAnimationFrame(() => {
      if (!mountedRef.current) {
        return;
      }
      setSearchTerm(searchTerm ? searchTerm?.toLowerCase() : searchTerm).then(
        () => {
          if (registry.isCurrent(token)) {
            scrollTo(PickerMainRef.current, 0, () => registry.isCurrent(token));
          }
        },
      );
    });
  };
}

export function useIsEmojiFiltered(): (unified: string) => boolean {
  const { current: filter } = useFilterRef();
  const [searchTerm] = useSearchTermState();

  return (unified) => isEmojiFilteredBySearchTerm(unified, filter, searchTerm);
}

export function isEmojiFilteredBySearchTerm(
  unified: string,
  filter: FilterState,
  searchTerm: string,
): boolean {
  if (!filter || !searchTerm) {
    return false;
  }

  return !filter[searchTerm]?.[unified];
}

export type FilterDict = Record<string, DataEmoji>;

export function filterEmojiObjectByKeyword(
  emojis: FilterDict,
  keyword: string,
): FilterDict {
  const filtered: FilterDict = {};
  Object.keys(emojis).forEach((unified) => {
    const emoji = emojis[unified];
    if (
      emojiNames(emoji).some((name) => name.toLowerCase().includes(keyword))
    ) {
      filtered[unified] = emoji;
    }
  });
  return filtered;
}

export function findLongestMatch(
  keyword: string,
  dict: Record<string, FilterDict> | null,
): FilterDict | null {
  if (!dict) return null;
  if (dict[keyword]) return dict[keyword];
  const longest = Object.keys(dict)
    .sort((left, right) => right.length - left.length)
    .find((key) => keyword.includes(key));
  return longest ? dict[longest] : null;
}
