import { cx } from 'flairup';
import * as React from 'react';
import { useState } from 'react';

import { stylesheet } from '../../Stylesheet/stylesheet';
import { categoryFromCategoryConfig } from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { useActiveCategoryScrollDetection } from '../../hooks/useActiveCategoryScrollDetection';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useScrollCategoryIntoView } from '../../hooks/useScrollCategoryIntoView';
import { useShouldHideCustomEmojis } from '../../hooks/useShouldHideCustomEmojis';
import { isCustomCategory } from '../../typeRefinements/typeRefinements';
import { useCategoryNavigationRef } from '../context/ElementRefContext';

import { CategoryButton } from './CategoryButton';

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

        const allowNavigation = !isSearchMode && !isActiveCategory;

        return (
          <CategoryButton
            key={category}
            category={category}
            isActiveCategory={isActiveCategory}
            allowNavigation={allowNavigation}
            categoryConfig={categoryConfig}
            onClick={() => {
              setActiveCategory(category);
              scrollCategoryIntoView(category);
            }}
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
  }
});
