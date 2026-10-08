import { Categories, CategoryConfig } from '../types/exposedTypes';

import { UserCategoryConfig } from './categoryConfig';
import { PickerConfig } from './config';
import { CustomEmoji } from './customEmojiConfig';

// Callbacks are read through the mutable config ref, so a new function
// identity must never rebuild configuration or rerender the memoized tree.
const CALLBACK_KEYS: ReadonlySet<string> = new Set([
  'onEmojiClick',
  'onReactionClick',
  'onSkinToneChange',
  'onSearchChange',
  'onReactionsModeChange',
]);

/**
 * Content equality over every config key. Iterating the union of keys
 * (rather than a hand-maintained list) means a prop added later is
 * compared by default instead of being silently ignored after mount —
 * which is how `reactions`, `previewConfig`, `hiddenEmojis`,
 * `allowExpandReactions`, `categoryIcons`, `getEmojiUrl` and `nonce`
 * updates used to be dropped.
 */
export function compareConfig(prev: PickerConfig, next: PickerConfig) {
  const prevRecord = prev as Record<string, unknown>;
  const nextRecord = next as Record<string, unknown>;
  const keys = Object.keys(prevRecord).concat(
    Object.keys(nextRecord).filter((key) => !(key in prevRecord)),
  );

  for (const key of keys) {
    if (CALLBACK_KEYS.has(key)) {
      continue;
    }
    if (!configValueEqual(key, prevRecord[key], nextRecord[key])) {
      return false;
    }
  }
  return true;
}

type ValueComparator = (prev: unknown, next: unknown) => boolean;

const identityOnly: ValueComparator = () => false;

// Keys with dedicated structural comparisons. `emojiData` and `style` are
// identity-only: datasets are large (identity is the contract, see
// useDataIdentityStabilityWarning) and style objects feed the DOM.
const KEY_COMPARATORS: Record<string, ValueComparator> = {
  customEmojis: (prev, next) =>
    customEmojisEqual(
      (prev as CustomEmoji[] | undefined) ?? [],
      (next as CustomEmoji[] | undefined) ?? [],
    ),
  categories: (prev, next) =>
    categoriesEqual(
      prev as UserCategoryConfig | undefined,
      next as UserCategoryConfig | undefined,
    ),
  suggestedEmojis: (prev, next) =>
    suggestedEmojisEqual(
      prev as string[] | undefined,
      next as string[] | undefined,
    ),
  emojiData: identityOnly,
  style: identityOnly,
};

function configValueEqual(key: string, prev: unknown, next: unknown): boolean {
  if (prev === next) {
    return true;
  }
  const comparator = KEY_COMPARATORS[key];
  if (comparator) {
    return comparator(prev, next);
  }
  return genericValueEqual(prev, next);
}

function genericValueEqual(prev: unknown, next: unknown): boolean {
  if (Array.isArray(prev) && Array.isArray(next)) {
    return shallowArrayEqual(prev, next);
  }
  if (isPlainObject(prev) && isPlainObject(next)) {
    return shallowObjectEqual(prev, next);
  }
  return false;
}

function shallowArrayEqual(prev: unknown[], next: unknown[]): boolean {
  return (
    prev.length === next.length &&
    prev.every((entry, index) => entry === next[index])
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function shallowObjectEqual(
  prev: Record<string, unknown>,
  next: Record<string, unknown>,
): boolean {
  const prevKeys = Object.keys(prev);
  if (prevKeys.length !== Object.keys(next).length) {
    return false;
  }
  return prevKeys.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(next, key) &&
      prev[key] === next[key],
  );
}

/**
 * Element-wise equality for caller-defined suggestions. Compared by value
 * (not identity) so inline literals with equal contents don't rebuild the
 * merged configuration on every parent render.
 */
function suggestedEmojisEqual(
  prev: string[] | undefined,
  next: string[] | undefined,
): boolean {
  if (prev === next) {
    return true;
  }
  if (!prev || !next || prev.length !== next.length) {
    return false;
  }
  return prev.every((entry, index) => entry === next[index]);
}

/**
 * Structural content equality for custom emojis. Length alone misses
 * regroups and swaps, which would leave merged categories, search, and
 * sections stale. Fields are compared element-wise (never serialized
 * with delimiters) so user-controlled values cannot collide.
 */
function customEmojisEqual(prev: CustomEmoji[], next: CustomEmoji[]): boolean {
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
