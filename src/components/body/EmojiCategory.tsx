import * as React from 'react';

import { ClassNames, clsx } from '../../DomUtils/classNames';
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
      className={clsx(ClassNames.category, {
        [ClassNames.hidden]: hidden,
        [ClassNames.hiddenOnSearch]: hiddenOnSearch
      })}
      data-name={category}
      aria-label={categoryName}
    >
      <div className={ClassNames.label}>{categoryName}</div>
      <div className={ClassNames.categoryContent}>{children}</div>
    </li>
  );
}
