import * as React from 'react';
import './CategoryNavigation.css';
import clsx from 'clsx';
import categories from '../../dataUtils/categories';

export function CategoryNavigation() {
  const [activeCategory] = React.useState(categories[0]);
  return (
    <div className="epr-category-nav">
      {categories.map(category => (
        <button
          className={clsx('epr-cat-btn', `epr-icn-${category}`, {
            active: category === activeCategory
          })}
          key={category}
        />
      ))}
    </div>
  );
}
