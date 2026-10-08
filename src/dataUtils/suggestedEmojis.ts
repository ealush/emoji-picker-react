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

function resolveEntryId(
  id: string,
  lookup: (normalizedId: string) => DataEmoji | undefined,
): string | undefined {
  if (!id) {
    return undefined;
  }
  if (isKnownRenderId(id, lookup)) {
    return id;
  }
  // Unified IDs and custom IDs are ASCII; anything else may be the
  // emoji character itself.
  if (Array.from(id).every((char) => (char.codePointAt(0) as number) < 0x80)) {
    return undefined;
  }
  return nativeToUnifiedCandidates(id).find((candidate) =>
    isKnownRenderId(candidate, lookup),
  );
}

// Dataset IDs are zero-padded code points joined by "-", and carry U+FE0F
// where the emoji presentation needs it; typed or stored characters often
// omit or add it. Try the exact sequence, then without FE0F, then with
// FE0F after the first code point (e.g. "©" -> "00a9-fe0f").
function nativeToUnifiedCandidates(native: string): string[] {
  const codePoints = Array.from(native).map((char) =>
    (char.codePointAt(0) as number).toString(16).padStart(4, '0'),
  );
  const exact = codePoints.join('-');
  const bare = codePoints.filter((codePoint) => codePoint !== 'fe0f');
  const withPresentation = [bare[0], 'fe0f', ...bare.slice(1)];
  return [exact, bare.join('-'), withPresentation.join('-')];
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
