import { EmojiProperties } from '../dataUtils/DataTypes';

import { CustomCategoryConfig } from './categoryConfig';

export type CustomEmoji = {
  [EmojiProperties.name]: string[];
  [EmojiProperties.imgUrl]: string;
};

export function shouldHideCustomCategory(
  customCategory: CustomCategoryConfig
): boolean {
  return customCategory.emojis.length === 0;
}
