import defaultEmojiData from './emojis';
import type { EmojiData } from '../types/exposedTypes';

let registered: EmojiData | null = defaultEmojiData as EmojiData;

export function registerDefaultEmojiData(data: EmojiData): void {
  registered = data;
}

export function getRegisteredDefaultEmojiData(): EmojiData | null {
  return registered;
}

export function defaultEmojiDataOrEmpty(): EmojiData {
  return registered ?? { categories: {}, emojis: {} };
}

export const EMPTY_EMOJI_DATA: EmojiData = Object.freeze({
  categories: {},
  emojis: {},
}) as EmojiData;

export function loadDefaultEmojiData(): Promise<EmojiData> {
  if (registered) return Promise.resolve(registered);
  registered = defaultEmojiData as EmojiData;
  return Promise.resolve(registered);
}
