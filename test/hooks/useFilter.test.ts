import { describe, expect, it } from 'vitest';

import { DataEmoji } from '../../src/dataUtils/DataTypes';
import {
  FilterDict,
  filterEmojiObjectByKeyword,
  findLongestMatch,
  isEmojiFilteredBySearchTerm
} from '../../src/hooks/useFilter';

const mockEmoji: DataEmoji = {
  n: ['grinning face', 'face', 'grin'],
  u: '1f600',
  a: '1' // added skin tone support property
};

const mockEmoji2: DataEmoji = {
  n: ['cat', 'pet'],
  u: '1f431',
  a: '1'
};

const mockFilterDict: FilterDict = {
  '1f600': mockEmoji,
  '1f431': mockEmoji2
};

describe('useFilter', () => {
  describe('findLongestMatch', () => {
    it('returns null if dict is null', () => {
      expect(findLongestMatch('foo', null)).toBeNull();
    });

    it('returns exact match if exists', () => {
      const dict = {
        foo: mockFilterDict
      };
      expect(findLongestMatch('foo', dict)).toBe(mockFilterDict);
    });

    it('returns longest matching key', () => {
      const dict = {
        f: { '1f600': mockEmoji },
        fo: mockFilterDict
      };
      // 'foo' contains 'fo' and 'f', should return 'fo' match
      expect(findLongestMatch('foo', dict)).toBe(mockFilterDict);
    });

    it('returns null if no match found', () => {
      const dict = {
        bar: mockFilterDict
      };
      expect(findLongestMatch('foo', dict)).toBeNull();
    });
  });

  describe('filterEmojiObjectByKeyword', () => {
    it('returns empty object if no emojis match', () => {
      expect(filterEmojiObjectByKeyword(mockFilterDict, 'xyz')).toEqual({});
    });

    it('returns matching emojis', () => {
      const result = filterEmojiObjectByKeyword(mockFilterDict, 'face');
      expect(result).toEqual({ '1f600': mockEmoji });
      expect(result['1f431']).toBeUndefined();
    });

    it('returns all matching emojis', () => {
      // both have 'a' in their names? 'face' and 'cat'
      // mockEmoji has 'face', mockEmoji2 has 'cat'. neither has 'a' in 'n' array directly but names contain letters.
      // names: ['grinning face', ...] and ['cat', ...]
      // search 'a' -> 'grinning face' has 'a', 'cat' has 'a'.
      const result = filterEmojiObjectByKeyword(mockFilterDict, 'a');
      expect(result).toEqual(mockFilterDict);
    });
  });

  describe('isEmojiFilteredBySearchTerm', () => {
    it('returns false if filter or searchTerm is missing', () => {
      expect(isEmojiFilteredBySearchTerm('1f600', {}, '')).toBe(false);
      expect(isEmojiFilteredBySearchTerm('1f600', null as any, 'foo')).toBe(
        false
      );
    });

    it('returns true if emoji is NOT in the filter result for the search term', () => {
      const filterState = {
        face: { '1f600': mockEmoji }
      };
      // '1f431' is not in the filtered results for 'face'
      expect(isEmojiFilteredBySearchTerm('1f431', filterState, 'face')).toBe(
        true
      );
    });

    it('returns false if emoji IS in the filter result for the search term', () => {
      const filterState = {
        face: { '1f600': mockEmoji }
      };
      // '1f600' is in the filtered results for 'face'
      expect(isEmojiFilteredBySearchTerm('1f600', filterState, 'face')).toBe(
        false
      );
    });
  });
});
