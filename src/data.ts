// Public v5 data entry point: `emoji-picker-react/data`.
//
// Additive to the existing top-level `emojiByUnified` export. Presents a
// normalized, documented shape and shares the pure data core with the picker.
// MUST NOT import React or ShipStyles (see docs/v5/DATA_API.md §5).

export { getEmojiByUnified, searchEmojis } from './data-core/search';
export type { EmojiData, EmojiDataOptions, EmojiInfo } from './data-core/types';
