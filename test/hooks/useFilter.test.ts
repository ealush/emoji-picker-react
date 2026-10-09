import { describe, expect, it } from 'vitest';

import { DataEmoji } from '../../src/dataUtils/DataTypes';
import {
  FilterDict,
  isEmojiFilteredBySearchTerm,
} from '../../src/hooks/useFilter';

const mockEmoji: DataEmoji = {
  n: ['grinning face', 'face', 'grin'],
  u: '1f600',
  a: '1', // added skin tone support property
};

const mockEmoji2: DataEmoji = {
  n: ['cat', 'pet'],
  u: '1f431',
  a: '1',
};

const mockFilterDict: FilterDict = {
  '1f600': mockEmoji,
  '1f431': mockEmoji2,
};

describe('useFilter', () => {
  // Query matching itself lives in the shared data core; delegation and
  // result equivalence are covered behaviorally in
  // test/search-unification-v5.test.tsx.

  describe('isEmojiFilteredBySearchTerm', () => {
    it('returns false if filter or searchTerm is missing', () => {
      expect(isEmojiFilteredBySearchTerm('1f600', {}, '')).toBe(false);
      expect(isEmojiFilteredBySearchTerm('1f600', null as any, 'foo')).toBe(
        false,
      );
    });

    it('returns true if emoji is NOT in the filter result for the search term', () => {
      const filterState = {
        face: { '1f600': mockEmoji },
      };
      // '1f431' is not in the filtered results for 'face'
      expect(isEmojiFilteredBySearchTerm('1f431', filterState, 'face')).toBe(
        true,
      );
    });

    it('returns false if emoji IS in the filter result for the search term', () => {
      const filterState = {
        face: { '1f600': mockEmoji },
      };
      // '1f600' is in the filtered results for 'face'
      expect(isEmojiFilteredBySearchTerm('1f600', filterState, 'face')).toBe(
        false,
      );
    });
  });
});
