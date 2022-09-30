import clsx from 'clsx';
import * as React from 'react';
import { useState } from 'react';
import './CategoryNavigation.css';

import { ClassNames } from '../../DomUtils/classNames';
import {
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { useActiveCategoryScrollDetection } from '../../hooks/useActiveCategoryScrollDetection';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useScrollCategoryIntoView } from '../../hooks/useScrollCategoryIntoView';
import { Button } from '../atoms/Button';
import { useCategoryNavigationRef } from '../context/ElementRefContext';

export function CategoryNavigation() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollCategoryIntoView = useScrollCategoryIntoView();
  useActiveCategoryScrollDetection(setActiveCategory);
  const isSearchMode = useIsSearchMode();

  const categoriesConfig = useCategoriesConfig();
  const CategoryNavigationRef = useCategoryNavigationRef();

  return (
    <div className="epr-category-nav" ref={CategoryNavigationRef}>
      {categoriesConfig.map(categoryConfig => {
        const category = categoryFromCategoryConfig(categoryConfig);
        return (
          <Button
            tabIndex={isSearchMode ? -1 : 0}
            className={clsx('epr-cat-btn', `epr-icn-${category}`, {
              [ClassNames.active]: category === activeCategory
            })}
            key={category}
            onClick={() => {
              setActiveCategory(category);
              scrollCategoryIntoView(category);
            }}
            aria-label={categoryNameFromCategoryConfig(categoryConfig)}
          />
        );
      })}
    </div>
  );
}
