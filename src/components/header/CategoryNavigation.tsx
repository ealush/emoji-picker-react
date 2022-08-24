import * as React from 'react';
import './CategoryNavigation.css';
import clsx from 'clsx';
import categories from '../../dataUtils/categories';
import { useActiveCategoryState } from '../contextProvider/PickerContextProvider';

interface Props { 
  categoriesNavRef:any
}

export function CategoryNavigation({categoriesNavRef}:Props) {
  const [
    activeCategory,
    ,
    setActiveCategoryAndScroll
  ] = useActiveCategoryState();
  return (
    <div className="epr-category-nav" ref={categoriesNavRef}>
      {categories.map(category => (
        <button
          className={clsx('epr-cat-btn', `epr-icn-${category}`, {
            active: category === activeCategory
          })}
          key={category}
          onClick={() => setActiveCategoryAndScroll(category)}
        />
      ))}
    </div>
  );
}
