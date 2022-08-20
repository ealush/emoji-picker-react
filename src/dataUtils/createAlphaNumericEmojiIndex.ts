import { allEmojis, emojiNames, emojiUnified } from './emojiSelectors';

export function createAlphaNumericEmojiIndex(): void {
  const searchIndex = allEmojis.reduce((searchIndex, emoji) => {
    const joinedNameString = []
      .concat(emojiNames(emoji))
      .join('')
      .replace(/[^a-zA-Z\d]/g, '');

    [...joinedNameString].forEach(char => {
      console.log(char, searchIndex[char]);
      searchIndex[char] = searchIndex[char] ?? new Set();

      searchIndex[char].add(emojiUnified(emoji));
    });
    return searchIndex;
  }, {});
}
