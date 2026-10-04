import * as React from 'react';

import {
  CategoryNavigation,
  useVisibleCategoryConfigs,
} from '../components/navigation/CategoryNavigation';

import { filterPrimitiveProps } from './nativeProps';
import { useRootScope } from './scope';
import type { CategoryNavProps } from './types';

// Public CategoryNav primitive (docs/v5/PRIMITIVES.md §11).
//
// Managed tablist region. Renders nothing when fewer than two tabs would
// be visible (mirroring the internal single-tab rule).
export const CategoryNav = /* @__PURE__ */ React.forwardRef<
  HTMLDivElement,
  CategoryNavProps
>(function CategoryNav(props, forwardedRef) {
  const inScope = useRootScope('CategoryNav');
  const visibleCategories = useVisibleCategoryConfigs();
  const { orientation = 'horizontal', ...rest } = props;
  const nativeProps = filterPrimitiveProps(rest as Record<string, unknown>, [
    'role',
  ]);

  if (!inScope || visibleCategories.length <= 1) {
    return null;
  }

  return (
    <div
      {...(nativeProps as React.HTMLAttributes<HTMLDivElement>)}
      ref={forwardedRef}
      data-epr-part="category-nav"
    >
      <CategoryNavigation orientation={orientation} />
    </div>
  );
});
