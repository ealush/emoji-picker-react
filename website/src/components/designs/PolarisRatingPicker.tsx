// Generated from stories/recipes/polaris-rating by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { Categories } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';

// `categories` narrows the picker to one section; CategoryNav would hide
// itself with a single tab, so it is simply not rendered.
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
      categories={[Categories.SMILEYS_PEOPLE]}
      autoFocusSearch={false}
    >
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
    </RootComponent>
  );
}
