import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import {
  commonInteractionStyles,
  commonStyles,
  stylesheet
} from '../../Stylesheet/stylesheet';
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
      className={cx(
        styles.category,
        hidden && commonStyles.hidden,
        hiddenOnSearch && commonInteractionStyles.hiddenOnSearch
      )}
      data-name={category}
      aria-label={categoryName}
    >
      <h2 className={cx(styles.label)}>{categoryName}</h2>
      <div className={cx(styles.categoryContent)}>{children}</div>
    </li>
  );
}

const styles = stylesheet.create({
  category: {
    '.': ClassNames.category,
    ':not(:has(.epr-visible))': {
      display: 'none'
    }
  },
  categoryContent: {
    '.': ClassNames.categoryContent,
    display: 'grid',
    gridGap: '0',
    gridTemplateColumns: 'repeat(auto-fill, var(--epr-emoji-fullsize))',
    justifyContent: 'space-between',
    margin: 'var(--epr-category-padding)',
    position: 'relative'
  },
  label: {
    '.': ClassNames.label,
    alignItems: 'center',
    // @ts-ignore - backdropFilter is not recognized.
    backdropFilter: 'blur(3px)',
    backgroundColor: 'var(--epr-category-label-bg-color)',
    color: 'var(--epr-category-label-text-color)',
    display: 'flex',
    fontSize: '16px',
    fontWeight: 'bold',
    height: 'var(--epr-category-label-height)',
    margin: '0',
    padding: 'var(--epr-category-label-padding)',
    position: 'sticky',
    textTransform: 'capitalize',
    top: '0',
    width: '100%',
    zIndex: 'var(--epr-category-label-z-index)'
  }
});
