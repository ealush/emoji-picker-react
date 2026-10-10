// Generated from stories/recipes/material-3 by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './Material3Picker';

// Material 3 picker: bottom tab bar with a pill indicator.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return <PickerExample Root={RootComponent} className={className} />;
}
