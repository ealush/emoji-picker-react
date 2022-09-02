import clsx from 'clsx';
import * as React from 'react';

import {
  CategoryConfig,
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';
import { ClassNames } from '../../DomUtils/classNames';
import './EmojiCategory.css';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
  children?: React.ReactNode;
  hidden?: boolean;
  hiddenOnSearch?: boolean;
}>;

export function EmojiCategory({
  categoryConfig,
  children,
  hidden,
  hiddenOnSearch
}: Props) {
  const category = categoryFromCategoryConfig(categoryConfig);
  const categoryName = categoryNameFromCategoryConfig(categoryConfig);

  return (
    <li
      className={clsx('epr-emoji-category', {
        [ClassNames.hidden]: hidden,
        [ClassNames.hiddenOnSearch]: hiddenOnSearch
      })}
      data-name={category}
    >
      <div className="epr-emoji-category-label">{categoryName}</div>
      {children}
    </li>
  );
}
