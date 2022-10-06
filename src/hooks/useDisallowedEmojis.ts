import { useRef, useMemo } from 'react';

import { useEmojiVersionConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import { addedIn, allEmojis, emojiUnified } from '../dataUtils/emojiSelectors';

export function useDisallowedEmojis() {
  const DisallowedEmojisRef = useRef<Record<string, boolean>>({});
  const emojiVersionConfig = useEmojiVersionConfig();

  return useMemo(() => {
    const emojiVersion = parseFloat(`${emojiVersionConfig}`);

    if (!emojiVersionConfig || Number.isNaN(emojiVersion)) {
      return DisallowedEmojisRef.current;
    }

    return allEmojis.reduce((disallowedEmojis, emoji) => {
      if (addedInNewerVersion(emoji, emojiVersion)) {
        disallowedEmojis[emojiUnified(emoji)] = true;
      }

      return disallowedEmojis;
    }, DisallowedEmojisRef.current);
  }, [emojiVersionConfig]);
}

function addedInNewerVersion(
  emoji: DataEmoji,
  supportedLevel: number
): boolean {
  return addedIn(emoji) > supportedLevel;
}
