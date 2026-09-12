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
    customEmojisKey(prevCustomEmojis) === customEmojisKey(nextCustomEmojis) &&
    categoriesKey(prev.categories) === categoriesKey(next.categories) &&
    prev.emojiData === next.emojiData
  );
}

/**
 * Content identity for custom emojis. Length alone misses regroups and
 * swaps, which would leave merged categories, search, and sections stale.
 */
function customEmojisKey(customEmojis: CustomEmoji[]): string {
  return customEmojis
    .map(
      emoji =>
        `${emoji.id}:${emoji.group ?? ''}:${emoji.names.join(',')}:${emoji.imgUrl}`,
    )
    .join('|');
}

/**
 * Content identity for the categories input. Order, labels, icons, and
 * group selection all flow into the merged configuration.
 */
function categoriesKey(categories: UserCategoryConfig | undefined): string {
  return (categories ?? [])
    .map(entry =>
      typeof entry === 'string'
        ? entry
        : `${entry.category}:${entry.name}:${entry.group ?? ''}:${entry.icon ? '1' : ''}`,
    )
    .join('|');
}
