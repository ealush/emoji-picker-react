import { DataEmoji } from './DataTypes';
import { allEmojis, emojiNames, emojiUnified } from './emojiSelectors';

export const alphaNumericEmojiIndex: BaseIndex = {};

setTimeout(() => {
  allEmojis.reduce((searchIndex, emoji) => {
    indexEmoji(emoji);
    return searchIndex;
  }, alphaNumericEmojiIndex as BaseIndex);
});

type BaseIndex = Record<string, Record<string, DataEmoji>>;

export function indexEmoji(emoji: DataEmoji): void {
  const joinedNameString = emojiNames(emoji)
    .flat()
    .join('')
    .toLowerCase()
    .replace(/[^a-zA-Z\d]/g, '')
    .split('');

  joinedNameString.forEach(char => {
    alphaNumericEmojiIndex[char] = alphaNumericEmojiIndex[char] ?? {};

    alphaNumericEmojiIndex[char][emojiUnified(emoji)] = emoji;
  });
}
