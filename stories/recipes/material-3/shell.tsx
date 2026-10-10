import React from 'react';

import * as Picker from '../../../src/primitives';

import { PickerExample } from './picker';

// Material 3 picker: bottom tab bar with a pill indicator.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return <PickerExample Root={RootComponent} className={className} />;
}
