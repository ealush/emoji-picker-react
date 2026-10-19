// The bundled default dataset (src/data/emojis.ts) stores skin-tone
// variation lists that follow a standard pattern as a rule number;
// src/data/expandVariations.ts restores them when the module loads, so
// the runtime value equals emojis.json. Most lists follow one of two
// rules, and spelling them out costs ~2.4 kB brotli in every bundle that
// includes the dataset. Kept free of side effects so tests can import it.
import type { OutputData } from './constants';

const TONES = ['1f3fb', '1f3fc', '1f3fd', '1f3fe', '1f3ff'];

/** The variation lists each rule produces for `unified` (rules 1 and 2). */
export function variationRules(unified: string): string[][] {
  const [first, ...rest] = unified.split('-');
  if (rest[0] === 'fe0f') rest.shift();
  return [
    TONES.map((tone) => `${unified}-${tone}`),
    TONES.map((tone) => [first, tone, ...rest].join('-')),
  ];
}

/** A copy of `data` with each rule-shaped variation list replaced by its rule number. */
export function compactVariations(data: OutputData): unknown {
  return {
    ...data,
    emojis: Object.fromEntries(
      Object.entries(data.emojis).map(([category, emojis]) => [
        category,
        emojis.map((emoji) => {
          const { v } = emoji;
          const rule = v
            ? variationRules(emoji.u).findIndex(
                (list) => list.join() === v.join(),
              )
            : -1;
          return rule < 0 ? emoji : { ...emoji, v: rule + 1 };
        }),
      ]),
    ),
  };
}
