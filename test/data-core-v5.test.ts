// The data entry registers the bundled dataset as the default; these
// tests exercise the core with that registration in place.
import '../src/data/registerDefaultEmojiData';
import { describe, expect, it } from 'vitest';

import { getPreparedCore, __resetPrepareCount, __getPrepareCount } from '../src/data-core/prepare';
import { getEmojiByUnified, searchEmojis } from '../src/data-core/search';
import defaultEmojiData from '../src/data/emojis';
import type { EmojiData } from '../src/types/exposedTypes';

describe('v5 data core', () => {
  it('normalizes unified lookup case-insensitively and trims', () => {
    const lower = getEmojiByUnified('1f600');
    expect(lower).toBeDefined();
    const upper = getEmojiByUnified('  1F600  ');
    expect(upper).toBe(lower);
  });

  it('maps variation lookup back to canonical base record', () => {
    const core = getPreparedCore();
    const withVariation = core.records.find((r) => r.variations.length > 0);
    if (!withVariation) {
      return;
    }
    const variation = withVariation.variations[0];
    const lookedUp = getEmojiByUnified(variation.toUpperCase());
    expect(lookedUp).toBe(withVariation);
    expect(lookedUp?.unified).toBe(withVariation.unified);
  });

  it('returns undefined for unknown/empty input', () => {
    expect(getEmojiByUnified('')).toBeUndefined();
    expect(getEmojiByUnified('   ')).toBeUndefined();
    expect(getEmojiByUnified('not-a-unified')).toBeUndefined();
  });

  it('returns deeply frozen records that cannot corrupt the cache', () => {
    const record = getEmojiByUnified('1f600');
    expect(record).toBeDefined();
    expect(Object.isFrozen(record)).toBe(true);
    expect(Object.isFrozen(record?.names)).toBe(true);
    expect(Object.isFrozen(record?.variations)).toBe(true);
    const again = getEmojiByUnified('1f600');
    expect(again).toBe(record);
  });

  it('search is case-insensitive, stable-ordered, fresh-frozen', () => {
    const a = searchEmojis('smile');
    const b = searchEmojis('  SMILE  ');
    expect(a.length).toBeGreaterThan(0);
    expect(b.map((r) => r.unified)).toEqual(a.map((r) => r.unified));
    expect(a).not.toBe(b);
    expect(Object.isFrozen(a)).toBe(true);
    // shared frozen records
    expect(a[0]).toBe(b[0]);
  });

  it('empty normalized query returns empty frozen array', () => {
    expect(searchEmojis('')).toEqual([]);
    expect(searchEmojis('   ')).toEqual([]);
    expect(Object.isFrozen(searchEmojis(''))).toBe(true);
  });

  it('single-char queries match the full scan via the prepared bucket', () => {
    const core = getPreparedCore();
    for (const char of ['a', 's', 'z']) {
      const expected = core.records
        .filter((record) => record.names.some((name) => name.includes(char)))
        .map((record) => record.unified);
      expect(searchEmojis(char).map((record) => record.unified)).toEqual(
        expected,
      );
    }
    // Unknown single chars return a frozen empty array.
    expect(searchEmojis('￿')).toEqual([]);
    expect(Object.isFrozen(searchEmojis('￿'))).toBe(true);
  });

  it('multi-char queries match the full scan via the smallest char bucket', () => {
    const core = getPreparedCore();
    const queries = ['sm', 'cat', 'SMILE', 'face with', 'flag', 'zz', 'qx', 'heart', ' a b ', 'no-match-zzz', 'ña', 'cat😀'];
    for (const raw of queries) {
      const query = raw.trim().toLowerCase();
      const expected = core.records
        .filter((record) => record.names.some((name) => name.includes(query)))
        .map((record) => record.unified);
      expect(searchEmojis(raw).map((record) => record.unified)).toEqual(
        expected,
      );
    }
  });

  it('uses supplied emojiData for lookup and search without mutating it', () => {
    const custom: EmojiData = {
      categories: {},
      emojis: {
        test: [
          { n: ['TestSmile'], u: '1f600', a: '1' } as never,
          { n: ['Other'], u: '1f601', a: '1' } as never,
        ],
      },
    };
    const snapshot = JSON.stringify(custom);
    expect(getEmojiByUnified('1f600', { emojiData: custom })?.names).toContain(
      'testsmile',
    );
    expect(
      searchEmojis('testsmile', { emojiData: custom }).map((r) => r.unified),
    ).toEqual(['1f600']);
    expect(JSON.stringify(custom)).toBe(snapshot);
    expect(Object.isFrozen(custom)).toBe(false);
  });

  it('caches prepared core by dataset identity (10 same-identity callers, 1 build)', () => {
    const custom: EmojiData = {
      categories: {},
      emojis: {
        test: [{ n: ['aa'], u: '1f600', a: '1' } as never],
      },
    };
    __resetPrepareCount();
    const before = __getPrepareCount();
    for (let i = 0; i < 10; i += 1) {
      getPreparedCore(custom);
    }
    expect(__getPrepareCount() - before).toBe(1);
    expect(getPreparedCore(custom)).toBe(getPreparedCore(custom));
    expect(getPreparedCore(defaultEmojiData as EmojiData)).toBe(
      getPreparedCore(),
    );
  });

  it('memoizes repeated identical query per prepared core', () => {
    const first = searchEmojis('smile');
    const core = getPreparedCore();
    expect(core.queryMemo.get('smile')).toBeDefined();
    const second = searchEmojis('smile');
    expect(second.map((r) => r.unified)).toEqual(
      first.map((r) => r.unified),
    );
    expect(second).not.toBe(first);
  });
});
