// Generated from stories/recipes/material-3 by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { SkinTonePickerLocation } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';


// Bottom navigation bar with the M3 pill indicator on the active tab
// ([aria-selected="true"]); circular emoji state layers.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent       className={className}
      searchPlaceholder="Search emoji"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.CategoryNav />
    </RootComponent>
  );
}
