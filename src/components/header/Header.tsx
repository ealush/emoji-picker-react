import * as React from 'react';
import Flex from '../Layout/Flex';
import Relative from '../Layout/Relative';
import { CategoryNavigation } from '../navigation/CategoryNavigation';
import './Header.css';
import { Search } from './Search';
import { SkinTonePicker } from './SkinTonePicker';

export function Header() {
  return (
    <Relative className="epr-header">
      <Flex className="epr-header-overlay">
        <Search />
        <SkinTonePicker />
      </Flex>
      <CategoryNavigation />
    </Relative>
  );
}
