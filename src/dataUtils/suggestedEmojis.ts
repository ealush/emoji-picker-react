import { DataEmoji, EmojiProperties } from './DataTypes';

// Caller-defined Suggested contents (docs/v5/STATE.md §9).
//
// While `suggestedEmojis` is present it fully determines the Suggested
// category contents/order and `suggestedEmojisMode` is ignored for
// selection/order. One case-insensitive rule covers both Unicode and
// custom IDs, matching how `customEmojis` are indexed (lowercased on
// entry). A valid skin-tone variation keeps that exact variation for
// rendering rather than collapsing to the neutral base. Unknown entries
// are ignored; duplicates collapse by resolved render identity with first
// occurrence winning; caller order is otherwise preserved. The input
// array is never mutated.

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
    const id = entry.trim().toLowerCase();
    if (!id || seen.has(id)) {
      continue;
    }
    if (!isKnownRenderId(id, lookup)) {
      continue;
    }
    seen.add(id);
    result.push(id);
  }

  return result;
}

// A render identity is valid only as the base unified or a listed
// variation. Anything else — e.g. a nonexistent variation that fell back
// to the base record — is unknown and ignored.
function isKnownRenderId(
  id: string,
  lookup: (normalizedId: string) => DataEmoji | undefined,
): boolean {
  const record = lookup(id);
  if (!record) {
    return false;
  }
  return (
    record[EmojiProperties.unified] === id ||
    (record[EmojiProperties.variations] ?? []).includes(id)
  );
}
