import clsx from 'clsx';
import * as React from 'react';

import {
  CategoryConfig,
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';
import './EmojiCategory.css';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
  children?: React.ReactNode;
  hidden?: boolean;
}>;

export function EmojiCategory({ categoryConfig, children, hidden }: Props) {
  const category = categoryFromCategoryConfig(categoryConfig);
  const categoryName = categoryNameFromCategoryConfig(categoryConfig);

  return (
    <li className={clsx('epr-emoji-category', { hidden })} data-name={category}>
      <div className="epr-emoji-category-label">{categoryName}</div>
      {children}
    </li>
  );
}
