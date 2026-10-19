// The `n` entry of every dataset record (scripts/prepare.ts). Kept free of
// side effects so tests can import it; prepare.ts writes files on import.
import type { EmojiRecord } from './constants';

/** Every name of an emojibase record, with `_` and `-` read as spaces. */
export const getNames = (emoji: EmojiRecord): string[] =>
  [
    emoji.label,
    emoji.annotation,
    ...(emoji.shortcodes || []),
    ...(emoji.shortcode ? [emoji.shortcode] : []),
    ...(emoji.tags || []),
  ]
    .filter(Boolean)
    .map((name) => String(name).replace(/[_-]/g, ' '));

/**
 * Keywords shortest first; the CLDR short name ("rocket", not "rockets")
 * last, where emojiName and every aria-label read it. A record without a
 * label fails the build: sorting alone would name it by its longest keyword.
 */
export function orderNames(emoji: EmojiRecord): string[] {
  const [name] = getNames({ label: emoji.label });
  if (!name)
    throw new Error(
      `emojibase record ${emoji.hexcode ?? emoji.emoji ?? '?'} has no label to name it by`,
    );
  const keywords = [...new Set(getNames(emoji))]
    .filter((keyword) => keyword !== name)
    .sort((a, b) => a.length - b.length);
  return [...keywords, name];
}
