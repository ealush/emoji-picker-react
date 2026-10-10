// Generated from stories/recipes/ios-bottom-sheet by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './IosBottomSheetPicker';

// In context: a phone showing the picker as a bottom sheet.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({
  Root: RootComponent = Picker.Root,
  className,
}: ShellProps) {
  return (
    <div className="ios-phone">
      <div className="ios-sheet-host">
        <PickerExample Root={RootComponent} className={className} />
      </div>
    </div>
  );
}
