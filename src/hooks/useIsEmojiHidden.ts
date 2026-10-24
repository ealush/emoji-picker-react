import { useCallback } from 'react';

import {
  useActiveSkinToneState,
  useEmojisThatFailedToLoadState,
} from '../components/context/PickerContext';
import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiUnified, emojiCanonicalUnified } from '../dataUtils/emojiUtils';

import { useIsEmojiFiltered } from './useFilter';

export function useIsEmojiHidden(): (emoji: DataEmoji) => IsHiddenReturn {
  const [activeSkinTone] = useActiveSkinToneState();
  // The tuple changes when its Root-local Set is mutated by an image error.
  const failures = useEmojisThatFailedToLoadState();
  const isEmojiFiltered = useIsEmojiFiltered();

  return useCallback(
    (emoji: DataEmoji): IsHiddenReturn => {
      const failedToLoad = failures[0].has(emojiUnified(emoji, activeSkinTone));
      const filteredOut = isEmojiFiltered(emojiCanonicalUnified(emoji));

      return {
        failedToLoad,
        filteredOut,
        hidden: failedToLoad || filteredOut,
      };
    },
    [activeSkinTone, failures, isEmojiFiltered],
  );
}

type IsHiddenReturn = {
  failedToLoad: boolean;
  filteredOut: boolean;
  hidden: boolean;
};
