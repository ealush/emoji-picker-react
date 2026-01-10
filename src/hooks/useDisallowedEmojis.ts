import { useRef, useMemo } from 'react';

import { usePickerDataContext } from '../components/context/PickerDataContext';
import { useEmojiVersionConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import {
  addedIn,
  emojiUnified,
  unifiedWithoutSkinTone
} from '../dataUtils/emojiUtils';

import { useIsUnicodeHidden } from './useHideEmojisByUniocode';

export function useDisallowedEmojis() {
  const DisallowedEmojisRef = useRef<Record<string, boolean>>({});
  const emojiVersionConfig = useEmojiVersionConfig();
  const { allEmojis } = usePickerDataContext();

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
  }, [emojiVersionConfig, allEmojis]);
}

export function useIsEmojiDisallowed() {
  const disallowedEmojis = useDisallowedEmojis();
  const isUnicodeHidden = useIsUnicodeHidden();

  return function isEmojiDisallowed(emoji: DataEmoji) {
    const unified = unifiedWithoutSkinTone(emojiUnified(emoji));

    return Boolean(disallowedEmojis[unified] || isUnicodeHidden(unified));
  };
}

function addedInNewerVersion(
  emoji: DataEmoji,
  supportedLevel: number
): boolean {
  return addedIn(emoji) > supportedLevel;
}
