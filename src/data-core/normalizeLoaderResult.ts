import type { EmojiData } from '../types/exposedTypes';

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

function isUnified(value: string): boolean {
  return value
    .split('-')
    .every(
      (hex) => /^[\da-f]{1,6}$/i.test(hex) && parseInt(hex, 16) <= 0x10ffff,
    );
}

function hasValidEncoding(value: Record<string, unknown>): boolean {
  if (value.imgUrl !== undefined) return typeof value.imgUrl === 'string';
  return (
    typeof value.u === 'string' &&
    isUnified(value.u) &&
    (value.v === undefined ||
      (isStringArray(value.v) && value.v.every(isUnified)))
  );
}

function isEmoji(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.u === 'string' &&
    !!value.u &&
    isStringArray(value.n) &&
    value.n.length > 0 &&
    typeof value.a === 'string' &&
    hasValidEncoding(value)
  );
}

function isEmojiGroup(value: unknown): boolean {
  return Array.isArray(value) && value.every(isEmoji);
}

function isCategory(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.category === 'string' &&
    typeof value.name === 'string'
  );
}

export function normalizeLoaderResult(
  result: EmojiData | { default: EmojiData },
): EmojiData {
  const data =
    isRecord(result) && 'default' in result ? result.default : result;
  if (
    !isRecord(data) ||
    !isRecord(data.categories) ||
    !isRecord(data.emojis) ||
    !Object.values(data.emojis).every(isEmojiGroup) ||
    !Object.values(data.categories).every(isCategory)
  ) {
    throw new Error(
      '[emoji-picker-react] emojiData loader must resolve a dataset or { default: dataset }.',
    );
  }
  return data as EmojiData;
}
