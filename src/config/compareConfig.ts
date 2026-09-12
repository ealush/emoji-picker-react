import { Categories, CategoryConfig } from '../types/exposedTypes';

import { UserCategoryConfig } from './categoryConfig';
import { PickerConfig } from './config';
import { CustomEmoji } from './customEmojiConfig';

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
    customEmojisEqual(prevCustomEmojis, nextCustomEmojis) &&
    categoriesEqual(prev.categories, next.categories) &&
    prev.emojiData === next.emojiData
  );
}

/**
 * Structural content equality for custom emojis. Length alone misses
 * regroups and swaps, which would leave merged categories, search, and
 * sections stale. Fields are compared element-wise (never serialized
 * with delimiters) so user-controlled values cannot collide.
 */
function customEmojisEqual(
  prev: CustomEmoji[],
  next: CustomEmoji[],
): boolean {
  if (prev.length !== next.length) {
    return false;
  }
  return prev.every((emoji, index) => {
    const other = next[index];
    return (
      emoji.id === other.id &&
      (emoji.group ?? '') === (other.group ?? '') &&
      emoji.imgUrl === other.imgUrl &&
      emoji.names.length === other.names.length &&
      emoji.names.every((name, nameIndex) => name === other.names[nameIndex])
    );
  });
}

/**
 * Structural content equality for the categories input. Order, labels,
 * group selection, and icon identity all flow into the merged
 * configuration. Icons compare by reference: swapping one icon element
 * for another must rebuild, while a stable reference stays cheap.
 */
function categoriesEqual(
  prev: UserCategoryConfig | undefined,
  next: UserCategoryConfig | undefined,
): boolean {
  const prevEntries = prev ?? [];
  const nextEntries = next ?? [];
  if (prevEntries.length !== nextEntries.length) {
    return false;
  }
  return prevEntries.every((entry, index) =>
    categoryEntriesEqual(entry, nextEntries[index]),
  );
}

/**
 * One categories entry compared structurally. Icons compare by reference:
 * swapping one icon element for another rebuilds, a stable reference stays
 * cheap. Delimited serialization is avoided so user-controlled values
 * cannot collide.
 */
function categoryEntriesEqual(
  entry: Categories | CategoryConfig,
  other: Categories | CategoryConfig,
): boolean {
  if (typeof entry === 'string' || typeof other === 'string') {
    return entry === other;
  }
  return (
    entry.category === other.category &&
    entry.name === other.name &&
    (entry.group ?? '') === (other.group ?? '') &&
    entry.icon === other.icon
  );
}
