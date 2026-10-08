import * as React from 'react';

import { ClassNames } from '../DomUtils/classNames';
import { scrollTo } from '../DomUtils/scrollTo';
import { NullableElement } from '../DomUtils/selectors';
import {
  useBodyRef,
  usePickerMainRef,
  useSearchInputRef,
} from '../components/context/ElementRefContext';
import {
  useNavigationRegistry,
  useSearchTermState,
} from '../components/context/PickerContext';
import { normalizeQuery } from '../data-core/prepare';

// A tab clicked right after editing the search (e.g. clearing it) lands
// before the debounced filter commit: sections are still collapsed or
// hidden, so the target's offset is about to move. Wait until the committed
// search matches the input and the target is laid out, with a safety cap;
// a newer jump supersedes this one.
const MAX_WAIT_MS = 3000;

// CSS.escape is missing in some embedded WebViews and older test DOMs; a
// quoted attribute value only needs backslashes and quotes escaped.
function escapeAttributeValue(value: string): string {
  return typeof CSS !== 'undefined' && CSS.escape
    ? CSS.escape(value)
    : value.replace(/["\\]/g, '\\$&');
}

function searchInputValue(input: HTMLInputElement | null): string | undefined {
  return input ? normalizeQuery(input.value) : undefined;
}

export function useScrollCategoryIntoView() {
  const BodyRef = useBodyRef();
  const PickerMainRef = usePickerMainRef();
  const SearchInputRef = useSearchInputRef();
  const registry = useNavigationRegistry();
  const [searchTerm] = useSearchTermState();
  const committedSearch = React.useRef(searchTerm);
  committedSearch.current = searchTerm;

  return function scrollCategoryIntoView(category: string): void {
    // An explicit jump supersedes pending scroll/focus work (e.g. the
    // post-search scroll to top).
    registry.invalidate();
    const generation = registry.currentGeneration();
    const deadline = Date.now() + MAX_WAIT_MS;

    // eslint-disable-next-line complexity
    const attempt = () => {
      if (!registry.isCurrent(generation) || !BodyRef.current) {
        return;
      }
      // Group names are user-controlled; escape for the attribute selector.
      const $category = BodyRef.current.querySelector(
        `[data-epr-category="${escapeAttributeValue(category)}"]`,
      ) as NullableElement;

      if (!$category) {
        return;
      }
      // Search and SearchInput share this native ref. A wrapper selector
      // misses BYOD inputs, and raw lowercase text does not match the
      // trimmed/lowercased query actually committed by useFilter.
      const typed = searchInputValue(SearchInputRef.current);
      const searchPending =
        typed !== undefined && typed !== (committedSearch.current || '');
      const unsettled =
        searchPending || $category.classList.contains(ClassNames.hidden);
      if (unsettled && Date.now() < deadline) {
        requestAnimationFrame(attempt);
        return;
      }

      // Removing the filter restores section presence before the height
      // measurement effects update preceding rows. Read the offset on the
      // next frame, after those updates, rather than retaining the short
      // search-result layout as the jump destination.
      scrollTo(
        PickerMainRef.current,
        () => $category.offsetTop,
        () =>
          registry.isCurrent(generation) &&
          !!BodyRef.current?.contains($category),
      );
    };
    attempt();
  };
}
