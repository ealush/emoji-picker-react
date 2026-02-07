import { Categories, CustomCategoryConfig } from '../config/categoryConfig';
import { CustomEmoji } from '../config/customEmojiConfig';
import { DataEmoji } from '../dataUtils/DataTypes';
import { CategoryConfig } from '../types/exposedTypes';

export function isCustomCategory(
  category: CategoryConfig | CustomCategoryConfig,
): category is CustomCategoryConfig {
  return category.category === Categories.CUSTOM;
}

export function isCustomEmoji(emoji: Partial<DataEmoji>): emoji is CustomEmoji {
  return emoji.imgUrl !== undefined;
}
