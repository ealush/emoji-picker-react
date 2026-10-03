import { useMemo } from 'react';

import { useNativeEmojiSupport } from '../components/context/PickerContext';
import { usePickerDataContext } from '../components/context/PickerDataContext';
import { useEmojiVersionConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import {
  addedIn,
  emojiUnified,
  unifiedWithoutSkinTone,
} from '../dataUtils/emojiUtils';
import { isCountryFlagUnified } from '../dataUtils/nativeEmojiSupport';

import { useIsUnicodeHidden } from './useHideEmojisByUniocode';

export function useDisallowedEmojis() {
  const emojiVersionConfig = useEmojiVersionConfig();
  const { allEmojis } = usePickerDataContext();
  // Detected platform support applies only while emojiVersion is unpinned
  // (the context is null otherwise).
  const nativeSupport = useNativeEmojiSupport();

  return useMemo(
    () =>
      computeDisallowedEmojis(
        allEmojis,
        emojiVersionConfig
          ? parseFloat(`${emojiVersionConfig}`)
          : (nativeSupport?.maxVersion ?? NaN),
        nativeSupport?.countryFlags === false,
      ),
    [emojiVersionConfig, nativeSupport, allEmojis],
  );
}

// A fresh record per input: lowering then raising emojiVersion must
// re-allow emojis, so results never accumulate across changes.
function computeDisallowedEmojis(
  allEmojis: DataEmoji[],
  emojiVersion: number,
  hideCountryFlags: boolean,
): Record<string, boolean> {
  const disallowedEmojis: Record<string, boolean> = {};
  const filterByVersion = !Number.isNaN(emojiVersion);

  if (!filterByVersion && !hideCountryFlags) {
    return disallowedEmojis;
  }

  for (const emoji of allEmojis) {
    const unified = emojiUnified(emoji);
    if (
      (filterByVersion && addedInNewerVersion(emoji, emojiVersion)) ||
      (hideCountryFlags && isCountryFlagUnified(unified))
    ) {
      disallowedEmojis[unified] = true;
    }
  }
  return disallowedEmojis;
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
