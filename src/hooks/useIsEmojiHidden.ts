import { useEmojisThatFailedToLoadState } from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified } from '../dataUtils/emojiSelectors';

import { useIsEmojiFiltered } from './useFilter';

export function useIsEmojiHidden(): (emoji: DataEmoji) => IsHiddenReturn {
  const [emojisThatFailedToLoad] = useEmojisThatFailedToLoadState();
  const isEmojiFiltered = useIsEmojiFiltered();

  return (emoji: DataEmoji): IsHiddenReturn => {
    const unified = emojiUnified(emoji);

    const failedToLoad = emojisThatFailedToLoad.has(unified);
    const filteredOut = isEmojiFiltered(unified);

    return {
      failedToLoad,
      filteredOut,
      hidden: failedToLoad || filteredOut
    };
  };
}

type IsHiddenReturn = {
  failedToLoad: boolean;
  filteredOut: boolean;
  hidden: boolean;
};
