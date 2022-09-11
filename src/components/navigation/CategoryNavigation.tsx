import clsx from 'clsx';
import * as React from 'react';
import './CategoryNavigation.css';

import { ClassNames } from '../../DomUtils/classNames';
import {
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { useCategoryNavigationRef } from '../context/ElementRefContext';
import { useActiveCategoryState } from '../context/PickerContext';

export function CategoryNavigation() {
  const categoriesConfig = useCategoriesConfig();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const [
    activeCategory,
    ,
    setActiveCategoryAndScroll
  ] = useActiveCategoryState();
  return (
    <div className="epr-category-nav" ref={CategoryNavigationRef}>
      {categoriesConfig.map(categoryConfig => {
        const category = categoryFromCategoryConfig(categoryConfig);
        return (
          <button
            className={clsx('epr-cat-btn', `epr-icn-${category}`, {
              [ClassNames.active]: category === activeCategory
            })}
            key={category}
            onClick={() => setActiveCategoryAndScroll(category)}
            aria-label={categoryNameFromCategoryConfig(categoryConfig)}
          />
        );
      })}
    </div>
  );
}
