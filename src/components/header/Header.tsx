import * as React from 'react';

import Relative from '../Layout/Relative';
import { CategoryNavigation } from '../navigation/CategoryNavigation';

import { SearchContainer } from './Search';

export function Header() {
  return (
    <Relative className="epr-header">
      <SearchContainer />
      <CategoryNavigation />
    </Relative>
  );
}
