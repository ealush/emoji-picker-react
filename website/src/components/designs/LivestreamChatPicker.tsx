// Generated from stories/recipes/livestream-chat by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

// Docked chat-column picker: a short panel with tabs on top and a
// compact grid.
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function PickerExample({
  Root: RootComponent = Picker.Root,
  className,
}: PickerExampleProps) {
  return (
    <RootComponent
      appearance="default"
      className={className}
      searchPlaceholder="Search emotes and emoji"
      autoFocusSearch={false}
    >
      <Picker.CategoryNav />
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
    </RootComponent>
  );
}
