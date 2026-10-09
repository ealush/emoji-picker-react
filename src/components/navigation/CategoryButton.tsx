import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import {
  commonInteractionStyles,
  darkMode,
  stylesheet,
} from '../../Stylesheet/stylesheet';
import {
  categoryIdFromCategoryConfig,
  categoryNameFromCategoryConfig,
} from '../../config/categoryConfig';
import { useDefaultAppearance } from '../../primitives/appearance';
import { usePickerComponents } from '../../primitives/components';
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

// eslint-disable-next-line complexity
export function CategoryButton({
  isActiveCategory,
  category,
  allowNavigation,
  categoryConfig,
  onClick,
  customIcon,
}: Props) {
  const appearance = useDefaultAppearance();
  const { CategoryButton: Custom } = usePickerComponents();
  const decorated = appearance && !Custom;
  // Priority: categoryConfig.icon > customIcon prop (from categoryIcons)
  const icon = categoryConfig.icon ?? customIcon;
  const hasCustomIcon = icon != null;

  const props: React.ButtonHTMLAttributes<HTMLButtonElement> = {
    type: 'button',
    tabIndex: allowNavigation ? 0 : -1,
    className: cx(
      styles.geometry,
      decorated && styles.catBtn,
      decorated && commonInteractionStyles.categoryBtn,
      hasCustomIcon ? styles.customIcon : `epr-icn-${category}`,
      { [ClassNames.active]: isActiveCategory },
    ),
    onClick: (event) => {
      if (!event.defaultPrevented) onClick();
    },
    'aria-label': categoryNameFromCategoryConfig(categoryConfig),
    'aria-selected': isActiveCategory,
    role: 'tab',
    children: hasCustomIcon ? icon : <CategoryNavIcon category={category} />,
  };
  const managed = {
    ...props,
    'data-epr-part': 'category-tab',
    'data-epr-active': isActiveCategory ? '' : undefined,
  };
  return Custom ? (
    <Custom
      {...managed}
      category={{
        id: categoryIdFromCategoryConfig(categoryConfig),
        name: categoryNameFromCategoryConfig(categoryConfig),
        isActive: isActiveCategory,
      }}
    />
  ) : (
    <Button {...managed} />
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

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    geometry: {
      display: 'inline-block',
      position: 'relative',
      height: 'var(--epr-category-navigation-button-size)',
      width: 'var(--epr-category-navigation-button-size)',
    },
    catBtn: {
      '.': 'epr-cat-btn',
      transition: 'opacity 0.2s ease-in-out',
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
  }))();
