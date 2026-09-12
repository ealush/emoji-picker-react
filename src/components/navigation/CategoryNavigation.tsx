import * as React from 'react';
import { useState } from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  categoryFromCategoryConfig,
  categoryIdFromCategoryConfig,
  customGroupFromCategoryConfig,
} from '../../config/categoryConfig';
import {
  useCategoriesConfig,
  useCategoryIconsConfig,
} from '../../config/useConfig';
import { useActiveCategoryScrollDetection } from '../../hooks/useActiveCategoryScrollDetection';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useScrollCategoryIntoView } from '../../hooks/useScrollCategoryIntoView';
import { useShouldHideCustomEmojis } from '../../hooks/useShouldHideCustomEmojis';
import { isCustomCategory } from '../../typeRefinements/typeRefinements';
import { Categories } from '../../types/exposedTypes';
import { useCategoryNavigationRef } from '../context/ElementRefContext';
import { useVisibleCategoriesState } from '../context/PickerContext';
import { usePickerDataContext } from '../context/PickerDataContext';

import { CategoryButton } from './CategoryButton';

export function CategoryNavigation() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [, setVisibleCategories] = useVisibleCategoriesState();
  const scrollCategoryIntoView = useScrollCategoryIntoView();
  useActiveCategoryScrollDetection({ setActiveCategory, setVisibleCategories });
  const isSearchMode = useIsSearchMode();

  const categoriesConfig = useCategoriesConfig();
  const categoryIcons = useCategoryIconsConfig();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const hideCustomCategory = useShouldHideCustomEmojis();
  const { customGroups } = usePickerDataContext();

  const visibleCategories = categoriesConfig.filter(categoryConfig => {
    if (isCustomCategory(categoryConfig) && hideCustomCategory) {
      return false;
    }
    // Group tabs with no members navigate to an empty (hidden) section.
    const group = customGroupFromCategoryConfig(categoryConfig);
    if (group) {
      return (customGroups[group]?.length ?? 0) > 0;
    }
    return true;
  });

  // A single tab navigates nowhere — hide the bar to reclaim its space.
  // https://github.com/ealush/emoji-picker-react/issues/396
  if (visibleCategories.length <= 1) {
    return null;
  }

  return (
    <div
      className={cx(styles.nav)}
      role="tablist"
      aria-label="Category navigation"
      id="epr-category-nav-id"
      ref={CategoryNavigationRef}
    >
      {visibleCategories.map(categoryConfig => {
        const category = categoryFromCategoryConfig(categoryConfig);
        const categoryId = categoryIdFromCategoryConfig(categoryConfig);
        const isActiveCategory = categoryId === activeCategory;

        const allowNavigation = !isSearchMode && !isActiveCategory;

        return (
          <CategoryButton
            key={categoryId}
            category={category}
            isActiveCategory={isActiveCategory}
            allowNavigation={allowNavigation}
            categoryConfig={categoryConfig}
            customIcon={categoryIcons[category as Categories]}
            onClick={() => {
              scrollCategoryIntoView(categoryId);
              setTimeout(() => {
                setActiveCategory(categoryId);
              }, 10);
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
    padding: 'var(--epr-header-padding)',
  },
  '.epr-search-active': {
    nav: {
      opacity: '0.3',
      cursor: 'default',
      pointerEvents: 'none',
    },
  },
  '.epr-main:has(input:not(:placeholder-shown))': {
    nav: {
      opacity: '0.3',
      cursor: 'default',
      pointerEvents: 'none',
    },
  },
});
