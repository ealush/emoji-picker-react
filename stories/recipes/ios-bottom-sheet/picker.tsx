import React from 'react';

import * as Picker from '../../../src/primitives';

import './panel.css';

// Narrow, touch-first: no Search (type-to-search is off with it), no
// section titles, 34px emojis.
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
    <RootComponent appearance="default" className={className}>
      <div className="ios-handle" />
      <Picker.Viewport>
        <Picker.List />
      </Picker.Viewport>
      <Picker.CategoryNav />
    </RootComponent>
  );
}
