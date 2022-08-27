import * as React from 'react';
import './EmojiCategory.css';
import {
  CategoryConfig,
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
  children?: React.ReactNode;
}>;

export function EmojiCategory({ categoryConfig, children }: Props) {
  const category = categoryFromCategoryConfig(categoryConfig);
  const categoryName = categoryNameFromCategoryConfig(categoryConfig);

  return (
    <li className="epr-emoji-category" data-name={category}>
      <div className="epr-emoji-category-label">{categoryName}</div>
      {children}
    </li>
  );
}
