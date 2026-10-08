import type { EmojiData } from '../types/exposedTypes';

// The bundled English dataset is no longer a static dependency of the
// picker core. Entry points that promise synchronous data (the default
// `emoji-picker-react` entry and `emoji-picker-react/data`) register it on
// import; `emoji-picker-react/primitives` does not, so a lean composition
// ships without it and loads it on demand (a separate chunk in ESM builds)
// unless `emojiData` is supplied.

let registered: EmojiData | null = null;

export function registerDefaultEmojiData(data: EmojiData): void {
  registered = data;
}

export function getRegisteredDefaultEmojiData(): EmojiData | null {
  return registered;
}

/** Stable empty dataset used while data is loading. */
export const EMPTY_EMOJI_DATA: EmojiData = Object.freeze({
  categories: {},
  emojis: {},
}) as EmojiData;

/** The registered dataset, or the empty placeholder before registration. */
export function defaultEmojiDataOrEmpty(): EmojiData {
  return registered ?? EMPTY_EMOJI_DATA;
}

let pending: Promise<EmojiData> | null = null;

/** Load (once) and register the bundled English dataset. */
export function loadDefaultEmojiData(): Promise<EmojiData> {
  if (registered) {
    return Promise.resolve(registered);
  }
  if (!pending) {
    pending = import('./emojis').then((module) => {
      const data = (module.default ?? module) as unknown as EmojiData;
      registered = registered ?? data;
      return registered;
    }).catch((error) => {
      pending = null;
      throw error;
    });
  }
  return pending;
}
