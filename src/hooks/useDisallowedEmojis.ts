import { useRef, useMemo } from 'react';

import { useEmojiVersionConfig, useShowEmojiConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import { addedIn, allEmojis, emojiUnified } from '../dataUtils/emojiSelectors';
import isFunction from '../predicates/isFunction';

export function useDisallowedEmojis() {
  const DisallowedEmojisRef = useRef<Record<string, boolean>>({});
  const emojiVersionConfig = useEmojiVersionConfig();
  const shouldShowEmoji = useShowEmojiConfig();

  return useMemo(() => {
    const emojiVersion = parseFloat(`${emojiVersionConfig}`);

    if (
      (!emojiVersionConfig || Number.isNaN(emojiVersion)) &&
      !shouldShowEmoji
    ) {
      return DisallowedEmojisRef.current;
    }

    return allEmojis.reduce((disallowedEmojis, emoji) => {
      if (isFunction(shouldShowEmoji) && !shouldShowEmoji(emoji)) {
        disallowEmoji();
      }

      if (addedInNewerVersion(emoji, emojiVersion)) {
        disallowEmoji();
      }

      return disallowedEmojis;

      function disallowEmoji() {
        disallowedEmojis[emojiUnified(emoji)] = true;
      }
    }, DisallowedEmojisRef.current);
  }, [emojiVersionConfig, shouldShowEmoji]);
}

function addedInNewerVersion(
  emoji: DataEmoji,
  supportedLevel: number
): boolean {
  return addedIn(emoji) > supportedLevel;
}
