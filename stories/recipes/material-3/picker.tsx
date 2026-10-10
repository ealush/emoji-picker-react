import React from 'react';

import * as Picker from '../../../src/primitives';

// Bottom navigation bar with the M3 pill indicator on the active tab
// ([aria-selected="true"]); circular emoji state layers.
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
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.CategoryNav />
    </RootComponent>
  );
}
