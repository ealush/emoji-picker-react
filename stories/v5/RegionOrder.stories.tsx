import React from 'react';

import * as Picker from '../../src/primitives';

// The same parts stacked in different orders. Arrow keys between parts
// follow the order on screen; covered by playwright/adoption-behavior.spec.ts.
export default { title: 'v5/Region order' };

type Part = 'nav' | 'search' | 'grid';

function Stack({ order }: { order: Part[] }) {
  const parts: Record<Part, React.ReactNode> = {
    nav: <Picker.CategoryNav key="nav" />,
    search: <Picker.Search key="search" />,
    grid: (
      <Picker.Viewport key="grid" style={{ flex: 1 }}>
        <Picker.List />
      </Picker.Viewport>
    ),
  };
  return (
    <Picker.Root
      appearance="default"
      colorScheme="light"
      autoFocusSearch={false}
      style={{
        height: 420,
        width: 350,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {order.map((part) => parts[part])}
    </Picker.Root>
  );
}

export const NavSearchGrid = () => <Stack order={['nav', 'search', 'grid']} />;
export const SearchGridNav = () => <Stack order={['search', 'grid', 'nav']} />;
export const GridSearchNav = () => <Stack order={['grid', 'search', 'nav']} />;
// DOM order search, grid, nav; CSS puts the tab bar on top.
export const CssReordered = () => (
  <div className="epr-css-reordered">
    <style>{`.epr-css-reordered [data-epr-part="category-nav"] { order: -1; }`}</style>
    <Stack order={['search', 'grid', 'nav']} />
  </div>
);

// A custom tab wrapped in an element of its own: arrows must find the tab,
// not the bar's direct children.
const wrappedTabs: Picker.PickerComponents = {
  CategoryButton: ({ category, ...props }) => (
    <span data-wrapper={category.id} style={{ display: 'block' }}>
      <button {...props} />
    </span>
  ),
};

// Search across the top; a vertical tab rail beside the grid below it.
function RailUnderSearch({
  dir,
  components,
}: {
  dir?: 'rtl';
  components?: Picker.PickerComponents;
}) {
  return (
    <div dir={dir}>
      <Picker.Root
        components={components}
        appearance="default"
        colorScheme="light"
        autoFocusSearch={false}
        style={{
          height: 420,
          width: 380,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Picker.Search />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Picker.CategoryNav orientation="vertical" />
          <Picker.Viewport style={{ flex: 1 }}>
            <Picker.List />
          </Picker.Viewport>
        </div>
      </Picker.Root>
    </div>
  );
}

export const RailBesideGrid = () => <RailUnderSearch />;
export const RailBesideGridRtl = () => <RailUnderSearch dir="rtl" />;
export const RailWrappedTabs = () => (
  <RailUnderSearch components={wrappedTabs} />
);
