import * as React from 'react';
import './CategoryNavigation.css';
import clsx from 'clsx';
import categories from '../../dataUtils/categories';
import { useActiveCategoryState } from '../contextProvider/PickerContextProvider';

export function CategoryNavigation() {
  const [activeCategory, setActiveCategory] = useActiveCategoryState();
  return (
    <div className="epr-category-nav">
      {categories.map(category => (
        <button
          className={clsx('epr-cat-btn', `epr-icn-${category}`, {
            active: category === activeCategory
          })}
          key={category}
          onClick={() => setActiveCategory(category)}
        />
      ))}
    </div>
  );
}
