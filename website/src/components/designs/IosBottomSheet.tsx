// Generated from stories/recipes/ios-bottom-sheet by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { SkinTonePickerLocation } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';


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
