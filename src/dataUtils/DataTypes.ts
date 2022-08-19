import emojis from '../data/emojis';

export type DataEmoji = {
  n: string[];
  u: string;
  v?: string[];
};
export type DataEmojis = DataEmoji[];

export type DataGroups = keyof typeof emojis;
