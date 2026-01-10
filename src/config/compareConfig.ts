import { PickerConfig } from './config';

// eslint-disable-next-line complexity
export function compareConfig(prev: PickerConfig, next: PickerConfig) {
  const prevCustomEmojis = prev.customEmojis ?? [];
  const nextCustomEmojis = next.customEmojis ?? [];
  return (
    prev.open === next.open &&
    prev.emojiVersion === next.emojiVersion &&
    prev.reactionsDefaultOpen === next.reactionsDefaultOpen &&
    prev.searchPlaceHolder === next.searchPlaceHolder &&
    prev.searchPlaceholder === next.searchPlaceholder &&
    prev.searchClearButtonLabel === next.searchClearButtonLabel &&
    prev.defaultSkinTone === next.defaultSkinTone &&
    prev.skinTonesDisabled === next.skinTonesDisabled &&
    prev.autoFocusSearch === next.autoFocusSearch &&
    prev.emojiStyle === next.emojiStyle &&
    prev.theme === next.theme &&
    prev.suggestedEmojisMode === next.suggestedEmojisMode &&
    prev.lazyLoadEmojis === next.lazyLoadEmojis &&
    prev.className === next.className &&
    prev.height === next.height &&
    prev.width === next.width &&
    prev.style === next.style &&
    prev.searchDisabled === next.searchDisabled &&
    prev.skinTonePickerLocation === next.skinTonePickerLocation &&
    prevCustomEmojis.length === nextCustomEmojis.length &&
    prev.emojiData === next.emojiData
  );
}
