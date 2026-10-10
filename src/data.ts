// Public v5 data entry point: `emoji-picker-react/data`.
//
// Additive to the existing top-level `emojiByUnified` export. Presents a
// normalized, documented shape and shares the pure data core with the picker.
// Must not import React or ShipStyles (enforced by npm run check:package).

import './data/registerDefaultEmojiData';

export { getEmojiByUnified, searchEmojis } from './data-core/search';
export type { EmojiData, EmojiDataOptions, EmojiInfo } from './data-core/types';
