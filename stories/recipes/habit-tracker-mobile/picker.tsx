import React from 'react';

import * as Picker from '../../../src/primitives';

// Mobile bottom-sheet picker: a header row, a horizontal tab strip and
// large tile-style emojis.
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
      searchPlaceholder="Search"
      autoFocusSearch={false}
    >
      <Picker.Search />
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
    </RootComponent>
  );
}
