import { memoize } from 'lodash';
import { DataEmoji } from './DataTypes';
import { allEmojis, emojiNames, emojiUnified } from './emojiSelectors';
import { reduceAsync } from './reduceAsync';

export const createAlphaNumericEmojiIndex = memoize(
  async function createAlphaNumericEmojiIndex(): Promise<
    Record<string, Set<DataEmoji>>
  > {
    return await reduceAsync(
      allEmojis,
      async (searchIndex, emoji) => {
        const joinedNameString = []
          .concat(emojiNames(emoji))
          .join('')
          .replace(/[^a-zA-Z\d]/g, '');

        [...joinedNameString].forEach(char => {
          searchIndex[char] = searchIndex[char] ?? new Set();

          searchIndex[char].add(emoji);
        });
        return searchIndex;
      },
      {}
    );
  }
);
