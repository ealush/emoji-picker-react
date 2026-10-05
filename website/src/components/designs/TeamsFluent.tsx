// Generated from stories/recipes/teams-fluent by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';


// Tabs first, then search: an order the default picker does not offer.
// The skin tone control keeps its default search placement.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent appearance="default" className={className} searchPlaceholder="Search emoji">
      <Picker.CategoryNav />
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.Preview />
    </RootComponent>
  );
}
