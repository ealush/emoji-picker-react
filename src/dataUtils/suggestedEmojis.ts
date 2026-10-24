import { withoutFe0f } from '../data-core/prepare';

import { DataEmoji, EmojiProperties } from './DataTypes';

// Caller-defined Suggested contents.
//
// While `suggestedEmojis` is present it fully determines the Suggested
// category contents/order and `suggestedEmojisMode` is ignored for
// selection/order. One case-insensitive rule covers both Unicode and
// custom IDs, matching how `customEmojis` are indexed (lowercased on
// entry). A valid skin-tone variation keeps that exact variation for
// rendering rather than collapsing to the neutral base. Unknown entries
// are ignored; duplicates collapse by resolved render identity with first
// occurrence winning; caller order is otherwise preserved. The input
// array is never mutated. Native emoji characters ("🧠", "©️") are accepted
// too and resolved to their unified ID, so apps that store recents as the
// characters they insert can pass them through unchanged.

export function resolveSuggestedRenderIds(
  entries: readonly string[],
  lookup: (normalizedId: string) => DataEmoji | undefined,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of entries) {
    if (typeof entry !== 'string') {
      continue;
    }
    const id = resolveEntryId(entry.trim().toLowerCase(), lookup);
    if (!id || seen.has(id)) {
      continue;
    }
    seen.add(id);
    result.push(id);
  }

  return result;
}

/**
 * A lowercased unified ID, custom ID or emoji character, resolved to a
 * known render identity (see resolveSuggestedRenderIds).
 */
export function resolveEntryId(
  id: string,
  lookup: (normalizedId: string) => DataEmoji | undefined,
): string | undefined {
  if (!id) {
    return undefined;
  }
  let unified = id;
  let record = lookup(id);
  // Unified IDs and custom IDs are ASCII; anything else may be the emoji
  // character itself, read as its code points.
  if (!record && /[^\0-\x7f]/.test(id)) {
    unified = Array.from(id)
      .map((char) =>
        (char.codePointAt(0) as number).toString(16).padStart(4, '0'),
      )
      .join('-');
    record = lookup(unified);
  }
  if (!record) {
    return undefined;
  }
  // A render identity is the base unified or a listed variation; a
  // nonexistent variation that fell back to the base record is unknown.
  // Typed, stored or other datasets' IDs often omit or add U+FE0F: resolve
  // to the record's own spelling of that identity.
  const known = [
    record[EmojiProperties.unified],
    ...(record[EmojiProperties.variations] ?? []),
  ];
  return known.includes(unified)
    ? unified
    : known.find((each) => withoutFe0f(each) === withoutFe0f(unified));
}
