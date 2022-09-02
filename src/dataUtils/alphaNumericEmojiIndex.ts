import { DataEmoji } from './DataTypes';
import { allEmojis, emojiNames, emojiUnified } from './emojiSelectors';

export const alphaNumericEmojiIndex: BaseIndex = {};

setTimeout(() => {
  allEmojis.reduce((searchIndex, emoji) => {
    const joinedNameString = emojiNames(emoji)
      .flat()
      .join('')
      .replace(/[^a-zA-Z\d]/g, '')
      .split('');

    joinedNameString.forEach(char => {
      searchIndex[char] = searchIndex[char] ?? {};

      searchIndex[char][emojiUnified(emoji)] = emoji;
    });
    return searchIndex;
  }, alphaNumericEmojiIndex as BaseIndex);
});

type BaseIndex = Record<string, Record<string, DataEmoji>>;
