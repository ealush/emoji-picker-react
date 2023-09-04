import {
  Categories,
  CategoryConfig,
  CustomCategoryConfig
} from '../config/categoryConfig';

export function isCustomCategory(
  category: CategoryConfig | CustomCategoryConfig
): category is CustomCategoryConfig {
  return category.category === Categories.CUSTOM;
}
