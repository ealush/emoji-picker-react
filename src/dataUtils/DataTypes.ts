import emojis from '../data/emojis';

export type DataEmoji = {
  n: string[];
  u: string;
  v?: string[];
  a: string;
  x: number;
  y: number;
};
export type DataEmojis = DataEmoji[];

export type DataGroups = keyof typeof emojis;
