// Generated from stories/recipes/linear-palette by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React, { useState } from 'react';

import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './LinearPalettePicker';

// Dismissible command-palette picker.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  const [open, setOpen] = useState(true);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)}>
        Open emoji picker
      </button>
    );
  return (
    <PickerExample
      Root={RootComponent}
      className={className}
      onClose={() => setOpen(false)}
    />
  );
}
