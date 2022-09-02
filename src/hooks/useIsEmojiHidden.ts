import { useEmojisThatFailedToLoadState } from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified } from '../dataUtils/emojiSelectors';

import { useIsEmojiFiltered } from './useFilter';

export function useIsEmojiHidden(): (emoji: DataEmoji) => boolean {
  const [emojisThatFailedToLoad] = useEmojisThatFailedToLoadState();
  const isEmojiFiltered = useIsEmojiFiltered();

  return (emoji: DataEmoji): boolean => {
    const unified = emojiUnified(emoji);

    return emojisThatFailedToLoad.has(unified) || isEmojiFiltered(unified);
  };
}
