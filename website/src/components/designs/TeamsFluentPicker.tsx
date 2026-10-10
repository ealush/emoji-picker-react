// Generated from stories/recipes/teams-fluent by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

// Tabs first, then search: an order the default picker does not offer.
// SkinTone is composed inside Search to share its header and keyboard flow.
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
      searchPlaceholder="Search emoji"
    >
      <Picker.CategoryNav />
      <Picker.Search>
        <Picker.SkinTone />
      </Picker.Search>
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.Preview />
    </RootComponent>
  );
}
