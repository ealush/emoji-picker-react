import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import {
  commonInteractionStyles,
  commonStyles,
  stylesheet,
} from '../../Stylesheet/stylesheet';
import {
  categoryIdFromCategoryConfig,
  categoryNameFromCategoryConfig,
} from '../../config/categoryConfig';
import { useDefaultAppearance } from '../../primitives/appearance';
import { CategoryConfig } from '../../types/exposedTypes';

import { useListComponents } from './listComponents';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
  children?: React.ReactNode;
  hidden?: boolean;
  hiddenOnSearch?: boolean;
  height?: number;
  emojisPerRow?: number;
  emojiCount?: number;
}>;

export function EmojiCategory({
  categoryConfig,
  children,
  hidden,
  hiddenOnSearch,
  height,
  emojisPerRow,
  emojiCount,
}: Props) {
  const appearance = useDefaultAppearance();
  const categoryName = categoryNameFromCategoryConfig(categoryConfig);
  const categoryId = categoryIdFromCategoryConfig(categoryConfig);
  const { CategoryHeader } = useListComponents();
  const hasCells = React.Children.count(children) > 0;

  return (
    <li
      className={cx(
        styles.category,
        hidden && commonStyles.hidden,
        hiddenOnSearch && commonInteractionStyles.hiddenOnSearch,
      )}
      data-epr-part="category"
      data-epr-category={categoryId}
      role="rowgroup"
      aria-label={categoryName}
    >
      {CategoryHeader ? (
        <CategoryHeader
          className={cx(styles.label)}
          aria-hidden
          data-epr-part="category-label"
          category={{ id: categoryId, name: categoryName }}
        >
          {categoryName}
        </CategoryHeader>
      ) : (
        // Visual only: the rowgroup already carries the category name, and
        // a heading is not an allowed child of a grid rowgroup.
        <h2
          className={cx(styles.label, appearance && styles.labelAppearance)}
          aria-hidden
          data-epr-part="category-label"
        >
          {categoryName}
        </h2>
      )}
      <div
        className={cx(styles.categoryContent)}
        style={{ height }}
        // A row must own cells: while virtualization renders none, the
        // container is presentational.
        role={hasCells ? 'row' : 'none'}
        data-epr-part="category-content"
        data-epr-emojis-per-row={emojisPerRow}
        data-epr-emoji-count={emojiCount}
      >
        {children}
      </div>
    </li>
  );
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    category: {
      '.': ClassNames.category,
      minHeight:
        'calc(var(--epr-emoji-fullsize) + var(--epr-category-label-height))',
      position: 'relative',
    },
    categoryContent: {
      '.': ClassNames.categoryContent,
      display: 'grid',
      gridGap: '0',
      gridTemplateColumns: 'repeat(auto-fill, var(--epr-emoji-fullsize))',
      justifyContent: 'space-between',
      margin: 'var(--epr-category-padding)',
      position: 'relative',
    },
    label: {
      '.': ClassNames.label,
      alignItems: 'center',
      display: 'flex',
      height: 'var(--epr-category-label-height)',
      margin: '0',
      padding: 'var(--epr-category-label-padding)',
      position: 'sticky',
      top: '0',
      width: '100%',
      zIndex: 'var(--epr-category-label-z-index)',
    },
    labelAppearance: {
      '.': 'epr-category-label-appearance',
      // @ts-ignore - backdropFilter is not recognized.
      backdropFilter: 'blur(3px)',
      backgroundColor: 'var(--epr-category-label-bg-color)',
      color: 'var(--epr-category-label-text-color)',
      fontSize: '16px',
      fontWeight: 'bold',
      textTransform: 'capitalize',
    },
  }))();
