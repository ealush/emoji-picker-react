import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataEmoji } from '../../src/dataUtils/DataTypes';
import { getSuggested, setSuggested } from '../../src/dataUtils/suggested';
import { SkinTones, SuggestionMode } from '../../src/types/exposedTypes';

const LS_KEY = 'epr_suggested';

function mockLocalStorage(initial: Record<string, string> = {}) {
  let store = { ...initial };
  const mock = {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
  Object.defineProperty(window, 'localStorage', {
    value: mock,
    configurable: true,
    writable: true,
  });
  return mock;
}

const grinning: DataEmoji = { n: ['grinning face'], u: '1f600', a: '1' };
const cat: DataEmoji = { n: ['cat'], u: '1f431', a: '1' };

const storedList = [
  { unified: '1f600', original: '1f600', count: 1 },
  { unified: '1f431', original: '1f431', count: 5 },
];

describe('getSuggested', () => {
  const original = window.localStorage;

  beforeEach(() => {
    mockLocalStorage();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: original,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('returns an empty list when storage is empty', () => {
    expect(getSuggested()).toEqual([]);
  });

  it('returns stored suggestions in insertion order by default', () => {
    mockLocalStorage({ [LS_KEY]: JSON.stringify(storedList) });

    expect(getSuggested()).toEqual(storedList);
    expect(getSuggested(SuggestionMode.RECENT)).toEqual(storedList);
  });

  it('sorts by count in FREQUENT mode', () => {
    mockLocalStorage({ [LS_KEY]: JSON.stringify(storedList) });

    expect(getSuggested(SuggestionMode.FREQUENT)).toEqual([
      storedList[1],
      storedList[0],
    ]);
  });

  it('returns an empty list for invalid JSON', () => {
    mockLocalStorage({ [LS_KEY]: 'not-json{' });

    expect(getSuggested()).toEqual([]);
  });

  it('returns an empty list when storage throws', () => {
    const storage = mockLocalStorage();
    storage.getItem.mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(getSuggested()).toEqual([]);
  });
});

describe('setSuggested', () => {
  const original = window.localStorage;

  beforeEach(() => {
    mockLocalStorage();
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: original,
      configurable: true,
      writable: true,
    });
    vi.restoreAllMocks();
  });

  it('stores a new emoji with count 1', () => {
    const storage = mockLocalStorage();

    setSuggested(grinning, SkinTones.NEUTRAL);

    expect(storage.setItem).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.setItem.mock.calls[0][1])).toEqual([
      { unified: '1f600', original: '1f600', count: 1 },
    ]);
  });

  it('moves an existing emoji to the front and increments its count', () => {
    const storage = mockLocalStorage({ [LS_KEY]: JSON.stringify(storedList) });

    setSuggested(grinning, SkinTones.NEUTRAL);

    expect(JSON.parse(storage.setItem.mock.calls[0][1])).toEqual([
      { unified: '1f600', original: '1f600', count: 2 },
      storedList[1],
    ]);
  });

  it('round-trips through getSuggested', () => {
    const storage = mockLocalStorage();
    const persisted: Record<string, string> = {};
    storage.setItem.mockImplementation((key: string, value: string) => {
      persisted[key] = value;
    });
    storage.getItem.mockImplementation((key: string) =>
      key in persisted ? persisted[key] : null,
    );

    setSuggested(grinning, SkinTones.NEUTRAL);
    setSuggested(cat, SkinTones.NEUTRAL);
    setSuggested(grinning, SkinTones.NEUTRAL);

    expect(getSuggested()).toEqual([
      { unified: '1f600', original: '1f600', count: 2 },
      { unified: '1f431', original: '1f431', count: 1 },
    ]);
  });

  it('caps the list at 14 entries, dropping the oldest', () => {
    const seed = Array.from({ length: 14 }, (_, i) => ({
      unified: `1f60${i}`,
      original: `1f60${i}`,
      count: 1,
    }));
    const storage = mockLocalStorage({ [LS_KEY]: JSON.stringify(seed) });

    setSuggested(cat, SkinTones.NEUTRAL);

    const next = JSON.parse(storage.setItem.mock.calls[0][1]);
    expect(next).toHaveLength(14);
    expect(next[0]).toEqual({
      unified: '1f431',
      original: '1f431',
      count: 1,
    });
    expect(next.map((item: { unified: string }) => item.unified)).not.toContain(
      '1f6013',
    );
  });

  it('ignores quota errors instead of throwing', () => {
    const storage = mockLocalStorage();
    storage.setItem.mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(() => setSuggested(grinning, SkinTones.NEUTRAL)).not.toThrow();
  });
});
