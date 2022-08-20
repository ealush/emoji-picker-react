import { DataEmoji } from './DataTypes';
import { allEmojis, emojiNames, emojiUnified } from './emojiSelectors';

export function createAlphaNumericEmojiIndex(): Record<string, Set<DataEmoji>> {
  return allEmojis.reduce((searchIndex, emoji) => {
    const joinedNameString = []
      .concat(emojiNames(emoji))
      .join('')
      .replace(/[^a-zA-Z\d]/g, '');

    [...joinedNameString].forEach(char => {
      searchIndex[char] = searchIndex[char] ?? new Set();

      searchIndex[char].add(emoji);
    });
    return searchIndex;
  }, {});
}
