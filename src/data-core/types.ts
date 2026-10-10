// v5 pure shared data core types.
//
// This module is intentionally free of React and ShipStyles imports so the
// `emoji-picker-react/data` entry can share it without pulling UI runtime.

import type { EmojiData } from '../types/exposedTypes';

export type { EmojiData };

export type EmojiInfo = Readonly<{
  /** Canonical/base lowercase unified code. */
  unified: string;

  /** The native emoji text for `unified`, ready to insert or render. */
  emoji: string;

  /** Display name: the dataset's full name (the last of `names`). */
  name: string;

  /** Search/display names in dataset order. */
  names: readonly string[];

  /** Lowercase unified codes for supported variations. */
  variations: readonly string[];

  /** Unicode/emoji version from the dataset. */
  addedIn: string;
}>;

export type EmojiDataOptions = Readonly<{
  /**
   * Optional dataset in the same shape accepted by the picker's emojiData prop.
   * Omit for the packaged default English dataset.
   */
  emojiData?: EmojiData;
}>;
