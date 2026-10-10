import { describe, expect, it } from 'vitest';

import * as dataEntry from '../src/data';
import { getEmojiByUnified, searchEmojis } from '../src/data';
import es from '../src/data/emojis-es';
import type { EmojiData } from '../src/types/exposedTypes';

// DATA_API.md: locale-aware search operates on the supplied dataset, and
// the initial data surface promises no shortcode conversion helpers.
describe('v5 locale-aware data', () => {
  it('searches locale names when emojiData is supplied', () => {
    const results = searchEmojis('sonrisa', {
      emojiData: es as unknown as EmojiData,
    });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((entry) =>
        entry.names.some((name) => name.includes('sonrisa')),
      ),
    ).toBe(true);
  });

  it('looks up unified codes in the supplied dataset', () => {
    const found = getEmojiByUnified('1F600', {
      emojiData: es as unknown as EmojiData,
    });
    expect(found?.unified).toBe('1f600');
    expect(found?.names.length).toBeGreaterThan(0);
  });

  it('exposes exactly the initial data surface (no shortcode conversion)', () => {
    expect(Object.keys(dataEntry).sort()).toEqual([
      'getEmojiByUnified',
      'searchEmojis',
    ]);
  });
});
