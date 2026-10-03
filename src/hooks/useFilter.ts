import * as React from 'react';

import { scrollTo } from '../DomUtils/scrollTo';
import {
  usePickerMainRef,
  useSearchInputRef,
} from '../components/context/ElementRefContext';
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
  const SearchInputRef = useSearchInputRef();
  const filterRef = useFilterRef();
  const setFilterRef = useSetFilterRef();
  const applySearch = useApplySearch();
  const { queryFilterDict } = usePickerDataContext();

  const [searchTerm] = useSearchTermState();

  return {
    onChange,
    searchTerm,
    SearchInputRef,
  };

  function onChange(inputValue: string) {
    const filter = filterRef.current;

    // Normalized derived query (STATE.md §2): the visible/callback value
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
    requestAnimationFrame(() => {
      if (!mountedRef.current) {
        return;
      }
      setSearchTerm(searchTerm ? searchTerm?.toLowerCase() : searchTerm).then(
        () => {
          scrollTo(PickerMainRef.current, 0);
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

