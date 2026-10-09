// Generated from stories/recipes/x-composer by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';


// The SkinTone primitive sits beside the search field in a consumer row
// (presence and placement are defined entirely by this JSX).
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent appearance="default"       className={className}
      searchPlaceholder="Search emojis"
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
