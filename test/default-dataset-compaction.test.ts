import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  compactVariations,
  variationRules,
} from '../scripts/compactVariations';
import defaultEmojiData from '../src/data/emojis';
import { expandVariations } from '../src/data/expandVariations';

const json = JSON.parse(
  readFileSync(join(__dirname, '..', 'src', 'data', 'emojis.json'), 'utf8'),
);

describe('compact default dataset', () => {
  it('loads exactly the dataset in emojis.json', () => {
    expect(defaultEmojiData).toEqual(json);
  });

  it('restores every list it stores as a rule', () => {
    const compact = compactVariations(json) as typeof json;
    const rules = Object.values(
      compact.emojis as Record<string, { v?: unknown }[]>,
    )
      .flat()
      .filter((emoji) => typeof emoji.v === 'number');
    expect(rules.length).toBeGreaterThan(300);
    expect(expandVariations(compact)).toEqual(json);
  });

  it('places the tone after the first code point, without fe0f', () => {
    expect(variationRules('261d-fe0f')[1][0]).toBe('261d-1f3fb');
    expect(variationRules('1f3c3-200d-2642-fe0f')[1][4]).toBe(
      '1f3c3-1f3ff-200d-2642-fe0f',
    );
  });

  it('keeps lists that follow neither rule', () => {
    const emoji = {
      n: ['handshake'],
      u: '1f91d',
      v: ['1f91d-1f3fb-200d-1faf2-1f3fc'],
    };
    const compact = compactVariations({
      categories: {},
      emojis: { people: [emoji] },
    }) as { emojis: { people: unknown[] } };
    expect(compact.emojis.people[0]).toBe(emoji);
  });
});
