import { cx } from 'flairup';
import * as React from 'react';
import { useState } from 'react';
import './CategoryNavigation.css';

import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { useActiveCategoryScrollDetection } from '../../hooks/useActiveCategoryScrollDetection';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useScrollCategoryIntoView } from '../../hooks/useScrollCategoryIntoView';
import { useShouldHideCustomEmojis } from '../../hooks/useShouldHideCustomEmojis';
import { isCustomCategory } from '../../typeRefinements/typeRefinements';
import { Button } from '../atoms/Button';
import { useCategoryNavigationRef } from '../context/ElementRefContext';

export function CategoryNavigation() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollCategoryIntoView = useScrollCategoryIntoView();
  useActiveCategoryScrollDetection(setActiveCategory);
  const isSearchMode = useIsSearchMode();

  const categoriesConfig = useCategoriesConfig();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const hideCustomCategory = useShouldHideCustomEmojis();

  return (
    <div
      className={cx(styles.nav)}
      role="tablist"
      aria-label="Category navigation"
      id="epr-category-nav-id"
      ref={CategoryNavigationRef}
    >
      {categoriesConfig.map(categoryConfig => {
        const category = categoryFromCategoryConfig(categoryConfig);
        const isActiveCategory = category === activeCategory;

        if (isCustomCategory(categoryConfig) && hideCustomCategory) {
          return null;
        }

        return (
          <Button
            tabIndex={isSearchMode || isActiveCategory ? -1 : 0}
            className={cx(styles.catBtn, `epr-icn-${category}`, {
              [ClassNames.active]: isActiveCategory
            })}
            key={category}
            onClick={() => {
              setActiveCategory(category);
              scrollCategoryIntoView(category);
            }}
            aria-label={categoryNameFromCategoryConfig(categoryConfig)}
            aria-selected={isActiveCategory}
            role="tab"
            aria-controls="epr-category-nav-id"
          />
        );
      })}
    </div>
  );
}

const styles = stylesheet.create({
  nav: {
    '.': 'epr-category-nav',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 'var(--epr-header-padding)'
  },
  '.epr-search-active': {
    nav: {
      opacity: '0.3',
      cursor: 'default',
      pointerEvents: 'none'
    }
  },
  '.epr-main:has(input:not(:placeholder-shown))': {
    nav: {
      opacity: '0.3',
      cursor: 'default',
      pointerEvents: 'none'
    }
  },
  catBtn: {
    '.': 'epr-cat-btn',
    display: 'inline-block',
    transition: 'opacity 0.2s ease-in-out',
    position: 'relative',
    height: 'var(--epr-category-navigation-button-size)',
    width: 'var(--epr-category-navigation-button-size)',
    backgroundSize: 'calc(var(--epr-category-navigation-button-size) * 10)',
    outline: 'none',
    backgroundPosition: '0 0',
    ':focus:before': {
      content: '',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      border: '2px solid var(--epr-category-icon-active-color)',
      borderRadius: '50%'
    }
  }
});
