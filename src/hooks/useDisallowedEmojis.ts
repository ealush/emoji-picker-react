import { useMemo } from 'react';

import { useNativeEmojiSupport } from '../components/context/PickerContext';
import { usePickerDataContext } from '../components/context/PickerDataContext';
import { useEmojiVersionConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import { isCountryFlagUnified } from '../dataUtils/nativeEmojiSupport';
import {
  addedIn,
  emojiUnified,
  unifiedWithoutSkinTone,
} from '../dataUtils/emojiUtils';

import { useIsUnicodeHidden } from './useHideEmojisByUniocode';

export function useDisallowedEmojis() {
  const emojiVersionConfig = useEmojiVersionConfig();
  const { allEmojis } = usePickerDataContext();
  // Detected platform support applies only while emojiVersion is unpinned
  // (the context is null otherwise).
  const nativeSupport = useNativeEmojiSupport();

  return useMemo(() => {
    const emojiVersion = emojiVersionConfig
      ? parseFloat(`${emojiVersionConfig}`)
      : (nativeSupport?.maxVersion ?? NaN);
    const hideCountryFlags = nativeSupport?.countryFlags === false;

    // A fresh record per version: lowering then raising emojiVersion must
    // re-allow emojis, so results never accumulate across changes.
    const disallowedEmojis: Record<string, boolean> = {};

    if (Number.isNaN(emojiVersion) && !hideCountryFlags) {
      return disallowedEmojis;
    }

    for (const emoji of allEmojis) {
      const unified = emojiUnified(emoji);
      if (
        (!Number.isNaN(emojiVersion) &&
          addedInNewerVersion(emoji, emojiVersion)) ||
        (hideCountryFlags && isCountryFlagUnified(unified))
      ) {
        disallowedEmojis[unified] = true;
      }
    }
    return disallowedEmojis;
  }, [emojiVersionConfig, nativeSupport, allEmojis]);
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
  supportedLevel: number,
): boolean {
  return addedIn(emoji) > supportedLevel;
}
