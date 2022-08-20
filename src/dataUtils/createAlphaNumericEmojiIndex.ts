import { allEmojis, emojiNames, emojiUnified } from './emojiSelectors';
import { reduceAsync } from './reduceAsync';

export async function createAlphaNumericEmojiIndex(): Promise<
  Record<string, Set<string>>
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

        searchIndex[char].add(emojiUnified(emoji));
      });
      return searchIndex;
    },
    {}
  );
}
