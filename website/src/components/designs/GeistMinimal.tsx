// Generated from stories/recipes/geist-minimal by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { SkinTonePickerLocation } from 'emoji-picker-react';
import * as Picker from 'emoji-picker-react/primitives';


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
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent       className={className}
      colorScheme="light"
      searchPlaceholder="Search…"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
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
