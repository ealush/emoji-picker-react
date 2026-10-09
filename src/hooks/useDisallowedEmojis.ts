import {
  useActiveSkinToneState,
  useNativeEmojiSupport,
} from '../components/context/PickerContext';
import { useEmojiVersionConfig, useUnicodeToHide } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import {
  addedIn,
  emojiUnified,
  unifiedWithoutSkinTone,
} from '../dataUtils/emojiUtils';
import { isNativeEmojiSupported } from '../dataUtils/nativeEmojiSupport';
import { isCustomEmoji } from '../typeRefinements/typeRefinements';

export function useIsEmojiDisallowed() {
  const configured = parseFloat(useEmojiVersionConfig() || '');
  const nativeSupport = useNativeEmojiSupport();
  // A configured cap restricts native support; it never overrides it.
  const cap = Number.isNaN(configured) ? Infinity : configured;
  const unicodeToHide = useUnicodeToHide();
  const [activeSkinTone] = useActiveSkinToneState();

  return function isEmojiDisallowed(
    emoji: DataEmoji,
    renderedUnified = emojiUnified(emoji, activeSkinTone),
  ) {
    if (unicodeToHide.has(unifiedWithoutSkinTone(emojiUnified(emoji))))
      return true;
    if (isCustomEmoji(emoji)) return false;
    return (
      addedIn(emoji) > cap ||
      !isNativeEmojiSupported(nativeSupport, renderedUnified)
    );
  };
}
