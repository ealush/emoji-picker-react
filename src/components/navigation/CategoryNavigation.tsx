import * as React from 'react';
import { useState } from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  categoryFromCategoryConfig,
  categoryIdFromCategoryConfig,
  customGroupFromCategoryConfig,
} from '../../config/categoryConfig';
import {
  useLabels,
  useCategoriesConfig,
  useCategoryIconsConfig,
} from '../../config/useConfig';
import useIsSearchMode from '../../hooks/useIsSearchMode';
import { useRegisterRegion } from '../../hooks/useRegisterRegion';
import { useScrollCategoryIntoView } from '../../hooks/useScrollCategoryIntoView';
import { useShouldHideCustomEmojis } from '../../hooks/useShouldHideCustomEmojis';
import { useDefaultAppearance } from '../../primitives/appearance';
import { isCustomCategory } from '../../typeRefinements/typeRefinements';
import { Categories } from '../../types/exposedTypes';
import { useCategoryNavigationRef } from '../context/ElementRefContext';
import { usePickerDataContext } from '../context/PickerDataContext';

import { CategoryButton } from './CategoryButton';

// Active category state lives with the scroll container (Viewport), which
// owns section observation. The tablist only highlights and scrolls.
// Keeping observation in the tablist would stop section tracking whenever
// the bar unmounts (single tab) or is omitted from a composition.
const ActiveCategoryContext = /* @__PURE__ */ React.createContext<{
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}>({
  activeCategory: null,
  setActiveCategory: () => {},
});

export function ActiveCategoryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const value = React.useMemo(
    () => ({ activeCategory, setActiveCategory }),
    [activeCategory],
  );
  return (
    <ActiveCategoryContext.Provider value={value}>
      {children}
    </ActiveCategoryContext.Provider>
  );
}

export function useActiveCategory() {
  return React.useContext(ActiveCategoryContext);
}

/**
 * Scroll a section to the top and highlight its tab. The highlight is set
 * explicitly: trailing sections too short to reach the viewport top would
 * otherwise leave an earlier section active.
 */
export function useJumpToCategory(): (categoryId: string) => void {
  const { setActiveCategory } = useActiveCategory();
  const scrollCategoryIntoView = useScrollCategoryIntoView();
  return (categoryId) => {
    scrollCategoryIntoView(categoryId);
    setTimeout(() => {
      setActiveCategory(categoryId);
    }, 10);
  };
}

export function useVisibleCategoryConfigs() {
  const categoriesConfig = useCategoriesConfig();
  const hideCustomCategory = useShouldHideCustomEmojis();
  const { customGroups, emojiData } = usePickerDataContext();

  return categoriesConfig.filter((categoryConfig) => {
    if (isCustomCategory(categoryConfig) && hideCustomCategory) {
      return false;
    }
    // Tabs navigating to an empty (hidden) section are dead weight.
    const group = customGroupFromCategoryConfig(categoryConfig);
    if (group) {
      return (customGroups[group]?.length ?? 0) > 0;
    }
    if (isCustomCategory(categoryConfig)) {
      return (emojiData.emojis?.[Categories.CUSTOM]?.length ?? 0) > 0;
    }
    return true;
  });
}

export type NavOrientation = 'horizontal' | 'vertical';

export function CategoryNavigation({
  orientation = 'horizontal',
}: {
  orientation?: NavOrientation;
} = {}) {
  const appearance = useDefaultAppearance();
  const { activeCategory } = useActiveCategory();
  const jumpToCategory = useJumpToCategory();
  const isSearchMode = useIsSearchMode();

  const categoryIcons = useCategoryIconsConfig();
  const CategoryNavigationRef = useCategoryNavigationRef();
  const labels = useLabels();

  const visibleCategories = useVisibleCategoryConfigs();

  // Registered before the single-tab early return so the tab bar leaves
  // the navigation graph when it unmounts.
  useRegisterRegion('categories', CategoryNavigationRef, [
    visibleCategories.length,
  ]);

  // A single tab navigates nowhere — hide the bar to reclaim its space.
  // https://github.com/ealush/emoji-picker-react/issues/396
  if (visibleCategories.length <= 1) {
    return null;
  }

  return (
    <div
      className={cx(
        styles.nav,
        appearance && styles.appearance,
        orientation === 'vertical' && styles.vertical,
      )}
      role="tablist"
      aria-label={labels.categoryNavigation}
      // Read by the keyboard handler: arrow keys follow the tab axis.
      aria-orientation={orientation}
      ref={CategoryNavigationRef}
    >
      {visibleCategories.map((categoryConfig) => {
        const category = categoryFromCategoryConfig(categoryConfig);
        const categoryId = categoryIdFromCategoryConfig(categoryConfig);
        const isActiveCategory = categoryId === activeCategory;

        const allowNavigation = !isSearchMode && !isActiveCategory;

        return (
          <CategoryButton
            key={categoryId}
            category={category}
            isActiveCategory={isActiveCategory}
            allowNavigation={allowNavigation}
            categoryConfig={categoryConfig}
            customIcon={categoryIcons[category as Categories]}
            onClick={() => jumpToCategory(categoryId)}
          />
        );
      })}
    </div>
  );
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    nav: {
      '.': 'epr-category-nav',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: 'var(--epr-header-padding)',
    },
    vertical: {
      '.': 'epr-category-nav-vertical',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: 'var(--epr-horizontal-padding)',
      padding: 'var(--epr-horizontal-padding) 0',
    },
    appearance: { '.': 'epr-category-nav-appearance' },
    '.epr-search-active': {
      nav: { pointerEvents: 'none' },
      appearance: {
        opacity: '0.3',
        cursor: 'default',
        pointerEvents: 'none',
      },
    },
    '.epr-structural-root:has(input:not(:placeholder-shown))': {
      nav: { pointerEvents: 'none' },
      appearance: {
        opacity: '0.3',
        cursor: 'default',
        pointerEvents: 'none',
      },
    },
  }))();
