import type { EmojiData } from '../types/exposedTypes';

// Restores the skin-tone variation lists the generated default dataset
// (emojis.ts) stores as a rule number (scripts/compactVariations.ts):
// 1 appends the tone, 2 puts it after the first code point, without fe0f.
const TONES = ['1f3fb', '1f3fc', '1f3fd', '1f3fe', '1f3ff'];

export function expandVariations(data: unknown): EmojiData {
  const dataset = data as {
    emojis: Record<string, { u: string; v?: number | string[] }[]>;
  };
  for (const emojis of Object.values(dataset.emojis))
    for (const emoji of emojis) {
      const rule = emoji.v;
      if (typeof rule !== 'number') continue;
      const [first, ...rest] = emoji.u.split('-');
      if (rest[0] === 'fe0f') rest.shift();
      emoji.v = TONES.map((tone) =>
        rule === 1 ? `${emoji.u}-${tone}` : [first, tone, ...rest].join('-'),
      );
    }
  return data as EmojiData;
}
