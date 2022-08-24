import * as React from 'react';
import Flex from '../Layout/Flex';
import { CategoryNavigation } from './CategoryNavigation';
import './Header.css';
import { Search } from './Search';
import { SkinTonePicker } from './SkinTonePicker';

export function Header() {
  return (
    <header className="epr-header">
      <CategoryNavigation />
      <Flex>
        <Search />
        <SkinTonePicker />
      </Flex>
    </header>
  );
}
