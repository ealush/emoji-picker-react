import * as React from 'react';
import { cx } from 'shipstyles';

import { commonInteractionStyles } from '../../Stylesheet/stylesheet';
import { CategoryNav, Search } from '../../primitives';
import Relative from '../Layout/Relative';

// Default header layout: private appearance/layout wrapper around the
// public Search and CategoryNav primitives.
export function Header() {
  return (
    <Relative
      className={cx('epr-header', commonInteractionStyles.hiddenOnReactions)}
    >
      <Search />
      <CategoryNav />
    </Relative>
  );
}
