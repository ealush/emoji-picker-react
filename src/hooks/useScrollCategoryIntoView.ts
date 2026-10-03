import * as React from 'react';

import { ClassNames } from '../DomUtils/classNames';
import { scrollTo } from '../DomUtils/scrollTo';
import { NullableElement } from '../DomUtils/selectors';
import {
  useBodyRef,
  usePickerMainRef,
} from '../components/context/ElementRefContext';
import {
  useNavigationRegistry,
  useSearchTermState,
} from '../components/context/PickerContext';

// A tab clicked right after editing the search (e.g. clearing it) lands
// before the debounced filter commit: sections are still collapsed or
// hidden, so the target's offset is about to move. Wait until the committed
// search matches the input and the target is laid out, with a safety cap;
// a newer jump supersedes this one.
const MAX_WAIT_MS = 3000;

function searchInputValue(root: Element | null): string | undefined {
  const input = root?.querySelector(
    '[data-epr-part="search"] input',
  ) as HTMLInputElement | null;
  return input ? input.value.toLowerCase() : undefined;
}

export function useScrollCategoryIntoView() {
  const BodyRef = useBodyRef();
  const PickerMainRef = usePickerMainRef();
  const registry = useNavigationRegistry();
  const latestJump = React.useRef(0);
  const [searchTerm] = useSearchTermState();
  const committedSearch = React.useRef(searchTerm);
  committedSearch.current = searchTerm;

  return function scrollCategoryIntoView(category: string): void {
    // An explicit jump supersedes pending scroll/focus work (e.g. the
    // post-search scroll to top).
    registry.invalidate();
    const jump = ++latestJump.current;
    const deadline = Date.now() + MAX_WAIT_MS;

    const attempt = () => {
      if (jump !== latestJump.current || !BodyRef.current) {
        return;
      }
      // Group names are user-controlled; escape for the attribute selector.
      const $category = BodyRef.current.querySelector(
        `[data-epr-category="${CSS.escape(category)}"]`,
      ) as NullableElement;

      if (!$category) {
        return;
      }
      const typed = searchInputValue(PickerMainRef.current);
      const searchPending =
        typed !== undefined && typed !== (committedSearch.current || '');
      const unsettled =
        searchPending || $category.classList.contains(ClassNames.hidden);
      if (unsettled && Date.now() < deadline) {
        requestAnimationFrame(attempt);
        return;
      }

      scrollTo(PickerMainRef.current, $category.offsetTop || 0);
    };
    attempt();
  };
}
