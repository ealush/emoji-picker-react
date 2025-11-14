import { cx } from 'flairup';
import * as React from 'react';

import { commonInteractionStyles } from '../../Stylesheet/stylesheet';
import { useShowSearchConfig } from '../../config/useConfig';
import Relative from '../Layout/Relative';
import { CategoryNavigation } from '../navigation/CategoryNavigation';

import { SearchContainer } from './Search/Search';

export function Header() {
  const showSearch = useShowSearchConfig();

  return (
    <Relative
      className={cx('epr-header', commonInteractionStyles.hiddenOnReactions)}
    >
      {showSearch ? <SearchContainer /> : null}
      <CategoryNavigation />
    </Relative>
  );
}
