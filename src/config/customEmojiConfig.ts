import { EmojiProperties } from '../dataUtils/DataTypes';

export type CustomEmoji = {
  [EmojiProperties.name]: string[];
  [EmojiProperties.imgUrl]: string;
};
