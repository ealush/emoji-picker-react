import * as React from 'react';
import { useState } from 'react';
import './CategoryNavigation.css';

import { ClassNames, clsx } from '../../DomUtils/classNames';
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
        className='epr-category-nav'
        role='tablist'
        aria-label='Category navigation'
        id='epr-category-nav-id'
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
            tabIndex={(isSearchMode || isActiveCategory) ? -1 : 0}
            className={clsx('epr-cat-btn', `epr-icn-${category}`, {
              [ClassNames.active]: isActiveCategory
            })}
            key={category}
            onClick={() => {
              setActiveCategory(category);
              scrollCategoryIntoView(category);
            }}
            aria-label={categoryNameFromCategoryConfig(categoryConfig)}
            aria-selected={isActiveCategory}
            role='tab'
            aria-controls='epr-category-nav-id'
          />
        );
      })}
    </div>
  );
}
