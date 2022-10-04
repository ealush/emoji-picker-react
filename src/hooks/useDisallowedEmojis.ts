import * as React from 'react';
import { useRef, useMemo } from 'react';

import { useAddedInConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import { addedIn, allEmojis, emojiUnified } from '../dataUtils/emojiSelectors';

export function useDisallowedEmojis() {
  const DisallowedEmojisRef = useRef<Record<string, boolean>>({});
  const addedInConfig = useAddedInConfig();

  return useMemo(() => {
    const addedInFloat = parseFloat(`${addedInConfig}`);

    if (!addedInConfig || Number.isNaN(addedInFloat)) {
      return DisallowedEmojisRef.current;
    }

    return allEmojis.reduce((disallowedEmojis, emoji) => {
      if (addedInNewerVersion(emoji, addedInFloat)) {
        disallowedEmojis[emojiUnified(emoji)] = true;
      }

      return disallowedEmojis;
    }, DisallowedEmojisRef.current);
  }, [addedInConfig]);
}

function addedInNewerVersion(
  emoji: DataEmoji,
  supportedLevel: number
): boolean {
  return addedIn(emoji) > supportedLevel;
}
