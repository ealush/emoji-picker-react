import clsx from 'clsx';
import * as React from 'react';
import './CategoryNavigation.css';

import { categoryFromCategoryConfig } from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { useActiveCategoryState } from '../context/PickerContext';
import { ClassNames } from '../../DomUtils/classNames';

export function CategoryNavigation() {
  const categoriesConfig = useCategoriesConfig();
  const [
    activeCategory,
    ,
    setActiveCategoryAndScroll
  ] = useActiveCategoryState();
  return (
    <div className="epr-category-nav">
      {categoriesConfig.map(categoryConfig => {
        const category = categoryFromCategoryConfig(categoryConfig);
        return (
          <button
            className={clsx('epr-cat-btn', `epr-icn-${category}`, {
              [ClassNames.active]: category === activeCategory
            })}
            key={category}
            onClick={() => setActiveCategoryAndScroll(category)}
          />
        );
      })}
    </div>
  );
}
