import { EmojiProperties } from '../dataUtils/DataTypes';

export type CustomEmoji = {
  names: string[];
  [EmojiProperties.imgUrl]: string;
  id: string;
};
