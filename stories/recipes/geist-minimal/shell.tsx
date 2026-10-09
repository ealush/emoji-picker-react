import React from 'react';

import * as Picker from '../../../src/primitives';

import './app.css';

function Header({ category, className, ...props }: Picker.CategoryHeaderRenderProps) {
  return (
    <h3 {...props} className={`${className} geist-header`}>
      {category.name}
    </h3>
  );
}

const components = { CategoryHeader: Header };

// colorScheme="light" supplies the default color tokens; the CSS only adjusts
// a handful. suggestedEmojis pins a product-specific first row.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent appearance="default"       className={className}
      colorScheme="light"
      searchPlaceholder="Search…"
      suggestedEmojis={['1f680', '2705', '1f6a7', '1f41b', '1f525', '1f4a1', '1f389', '1f440']}
    >
      <Picker.Search />
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List components={components} />
        <Picker.Empty />
      </Picker.Viewport>
    </RootComponent>
  );
}
