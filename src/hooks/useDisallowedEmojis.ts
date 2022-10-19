import { useRef, useMemo } from 'react';

import { useEmojiVersionConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import {
  addedIn,
  allEmojis,
  emojiUnified,
  unifiedWithoutSkinTone
} from '../dataUtils/emojiSelectors';

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

export function useIsEmojiDisallowed() {
  const disallowedEmojis = useDisallowedEmojis();

  return function isEmojiDisallowed(emoji: DataEmoji) {
    const unified = unifiedWithoutSkinTone(emojiUnified(emoji));

    return Boolean(disallowedEmojis[unified]);
  };
}

function addedInNewerVersion(
  emoji: DataEmoji,
  supportedLevel: number
): boolean {
  return addedIn(emoji) > supportedLevel;
}
