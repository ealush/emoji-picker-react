import emojis from '../data/emojis';

export enum EmojiProperties {
  name = 'n',
  unified = 'u',
  variations = 'v',
  added_in = 'a',
  imgUrl = 'imgUrl'
}

export type DataEmoji = {
  [EmojiProperties.name]: string[];
  [EmojiProperties.unified]: string;
  [EmojiProperties.variations]?: string[];
  [EmojiProperties.added_in]: string;
};
export type DataEmojis = DataEmoji[];

export type DataGroups = keyof typeof emojis;
