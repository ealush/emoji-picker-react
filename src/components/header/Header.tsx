import * as React from 'react';
import { CategoryNavigation } from './CategoryNavigation';
import './Header.css';
import { Search } from './Search';

export function Header() {
  return (
    <header className="epr-header">
      <CategoryNavigation />
      <Search />
    </header>
  );
}
