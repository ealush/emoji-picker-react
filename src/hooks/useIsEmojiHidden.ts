import {
  useActiveSkinToneState,
  useEmojisThatFailedToLoadState,
} from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiCanonicalUnified } from '../dataUtils/emojiUtils';

import { useIsEmojiFiltered } from './useFilter';

export function useIsEmojiHidden(): (emoji: DataEmoji) => IsHiddenReturn {
  const [activeSkinTone] = useActiveSkinToneState();
  const [emojisThatFailedToLoad] = useEmojisThatFailedToLoadState();
  const isEmojiFiltered = useIsEmojiFiltered();

  return (emoji: DataEmoji): IsHiddenReturn => {
    const failedToLoad = emojisThatFailedToLoad.has(
      emojiUnified(emoji, activeSkinTone),
    );
    const filteredOut = isEmojiFiltered(emojiCanonicalUnified(emoji));

    return {
      failedToLoad,
      filteredOut,
      hidden: failedToLoad || filteredOut,
    };
  };
}

type IsHiddenReturn = {
  failedToLoad: boolean;
  filteredOut: boolean;
  hidden: boolean;
};
