import {
  useFilterRef,
  useSearchTermState,
} from '../components/context/PickerContext';
import { useGetEmojisByCategory } from '../components/context/PickerDataContext';
import {
  categoryFromCategoryConfig,
  customGroupFromCategoryConfig,
} from '../config/categoryConfig';
import { useCategoriesConfig } from '../config/useConfig';
import {
  emojiUnified,
  unifiedWithoutSkinTone,
} from '../dataUtils/emojiUtils';

import { useIsEmojiDisallowed } from './useDisallowedEmojis';
import { useIsEmojiHidden } from './useIsEmojiHidden';

/**
 * Number of distinct emojis the list actually shows for the active search,
 * or null while no search is applied (or its results are not computed
 * yet). Uses the same predicates as the list itself, so configured
 * categories, emojiVersion, hiddenEmojis, platform support and failed
 * images are all accounted for — the raw match dictionary is not.
 */
export function useVisibleSearchResultCount(): number | null {
  const [searchTerm] = useSearchTermState();
  const filterRef = useFilterRef();
  const categories = useCategoriesConfig();
  const getEmojisByCategory = useGetEmojisByCategory();
  const isEmojiDisallowed = useIsEmojiDisallowed();
  const isEmojiHidden = useIsEmojiHidden();

  if (!searchTerm || !filterRef.current[searchTerm]) {
    return null;
  }

  const visible = new Set<string>();
  for (const categoryConfig of categories) {
    const emojis = getEmojisByCategory(
      categoryFromCategoryConfig(categoryConfig),
      customGroupFromCategoryConfig(categoryConfig),
    );
    for (const emoji of emojis) {
      if (!isEmojiDisallowed(emoji) && !isEmojiHidden(emoji).hidden) {
        visible.add(unifiedWithoutSkinTone(emojiUnified(emoji)));
      }
    }
  }
  return visible.size;
}
