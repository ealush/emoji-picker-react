import React from 'react';

import { SkinTonePickerLocation } from '../../../src';
import * as Picker from '../../../src/primitives';

import './app.css';

// Narrow, touch-first: no Search (type-to-search is off with it), no
// section titles, 34px emojis.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({
  Root: RootComponent = Picker.Root,
  className,
}: ShellProps) {
  return (
    <div className="ios-phone">
      <div className="ios-sheet-host">
        <RootComponent
          className={className}
          skinTonePickerLocation={SkinTonePickerLocation.NONE}
        >
          <div className="ios-handle" />
          <Picker.Viewport>
            <Picker.List />
          </Picker.Viewport>
          <Picker.CategoryNav />
        </RootComponent>
      </div>
    </div>
  );
}
