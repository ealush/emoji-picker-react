import * as React from 'react';
import './CategoryNavigation.css';
import groups from '../../data/groups';
import clsx from 'clsx';

export function CategoryNavigation() {
  return (
    <div className="epr-category-nav">
      {groups.map((category: string) => (
        <button className={clsx('epr-cat-btn', `epr-icn-${category}`)} />
      ))}
    </div>
  );
}
