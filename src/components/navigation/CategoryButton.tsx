import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import {
  commonInteractionStyles,
  darkMode,
  stylesheet,
} from '../../Stylesheet/stylesheet';
import { categoryNameFromCategoryConfig } from '../../config/categoryConfig';
import { CategoryConfig } from '../../types/exposedTypes';
import { Button } from '../atoms/Button';

import { CategoryNavIcon } from './CategoryNavIcon';

type Props = {
  isActiveCategory: boolean;
  category: string;
  allowNavigation: boolean;
  onClick: () => void;
  categoryConfig: CategoryConfig;
  customIcon?: React.ReactNode;
};

export function CategoryButton({
  isActiveCategory,
  category,
  allowNavigation,
  categoryConfig,
  onClick,
  customIcon,
}: Props) {
  // Priority: categoryConfig.icon > customIcon prop (from categoryIcons)
  const icon = categoryConfig.icon ?? customIcon;
  const hasCustomIcon = icon != null;

  return (
    <Button
      tabIndex={allowNavigation ? 0 : -1}
      className={cx(
        styles.catBtn,
        commonInteractionStyles.categoryBtn,
        hasCustomIcon ? styles.customIcon : `epr-icn-${category}`,
        {
          [ClassNames.active]: isActiveCategory,
        },
      )}
      onClick={onClick}
      aria-label={categoryNameFromCategoryConfig(categoryConfig)}
      aria-selected={isActiveCategory}
      role="tab"
      aria-controls="epr-category-nav-id"
    >
      {hasCustomIcon ? icon : <CategoryNavIcon category={category} />}
    </Button>
  );
}

const DarkActiveColor = {
  color: 'var(--epr-category-icon-active-color, #6AA9DD)',
};
const DarkInactiveColor = {
  color: 'var(--epr-category-icon-inactive-color, #C0C0BF)',
};

const DarkInactivePosition = {
  ':not(.epr-search-active)': {
    catBtn: {
      ':hover': DarkActiveColor,
      '&.epr-active': DarkActiveColor,
    },
  },
};

const styles = stylesheet.create({
  catBtn: {
    '.': 'epr-cat-btn',
    display: 'inline-block',
    transition: 'opacity 0.2s ease-in-out',
    position: 'relative',
    height: 'var(--epr-category-navigation-button-size)',
    width: 'var(--epr-category-navigation-button-size)',
    outline: 'none',
    // Icon glyphs are inline SVGs painted with currentColor, so the fill
    // follows the --epr-category-icon-*-color variables.
    // https://github.com/ealush/emoji-picker-react/issues/399
    color: 'var(--epr-category-icon-inactive-color, #868686)',
    ':focus:before': {
      content: '',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      border: '2px solid var(--epr-category-icon-active-color)',
      borderRadius: '50%',
    },
  },
  customIcon: {
    '.': 'epr-cat-btn-custom-icon',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ...darkMode('catBtn', DarkInactiveColor),
  '.epr-dark-theme': {
    ...DarkInactivePosition,
  },
  '.epr-auto-theme': {
    ...DarkInactivePosition,
  },
});
