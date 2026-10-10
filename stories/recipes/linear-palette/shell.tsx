import React, { useState } from 'react';

import * as Picker from '../../../src/primitives';

import { PickerExample } from './picker';

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
