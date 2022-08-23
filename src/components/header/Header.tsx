import * as React from 'react';
import Relative from '../Layout/Relative';
import { CategoryNavigation } from './CategoryNavigation';
import './Header.css';
import { Search } from './Search';
import { SkinTonePicker } from './SkinTonePicker';

export function Header() {
  return (
    <header className="epr-header">
      <CategoryNavigation />
      <Relative>
        <SkinTonePicker />
        <Search />
      </Relative>
    </header>
  );
}
