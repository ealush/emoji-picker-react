import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames, clsx } from '../../DomUtils/classNames';
import { sheet } from '../../DomUtils/stylesheet';
import {
  CategoryConfig,
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
  children?: React.ReactNode;
  hidden?: boolean;
  hiddenOnSearch?: boolean;
}>;

const styles = sheet.create({
  emojiCategory: {
    '.': ClassNames.category,
    ':not(:has(.epr-visible))': {
      display: 'none'
    }
  },
  categoryContent: {
    '.': ClassNames.categoryContent,
    position: 'relative',
    margin: 'var(--epr-category-padding)',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, var(--epr-emoji-fullsize))',
    gridGap: '0',
    justifyContent: 'space-between'
  },
  categoryLabel: {
    '.': ClassNames.label,
    position: 'sticky',
    top: '0',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '0',
    textTransform: 'capitalize',
    backdropFilter: 'blur(3px)',
    padding: 'var(--epr-category-label-padding)',
    backgroundColor: 'var(--epr-category-label-bg-color)',
    color: 'var(--epr-category-label-text-color)',
    zIndex: 'var(--epr-category-label-z-index)',
    height: 'var(--epr-category-label-height)'
  }
});

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
      className={clsx(cx(styles.emojiCategory), {
        [ClassNames.hidden]: hidden,
        [ClassNames.hiddenOnSearch]: hiddenOnSearch
      })}
      data-name={category}
      aria-label={categoryName}
    >
      <h2 className={cx(styles.categoryLabel)}>{categoryName}</h2>
      <div className={cx(styles.categoryContent)}>{children}</div>
    </li>
  );
}
