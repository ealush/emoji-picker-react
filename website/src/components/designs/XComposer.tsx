// Generated from stories/recipes/x-composer by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { SkinTonePickerLocation } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';


// The SkinTone primitive sits beside the search field in a consumer row
// (the built-in placement is turned off with NONE).
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent appearance="default"       className={className}
      searchPlaceholder="Search emojis"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <div className="x-header">
        <Picker.Search />
        <Picker.SkinTone />
      </div>
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
    </RootComponent>
  );
}
