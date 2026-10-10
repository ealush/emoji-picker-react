// Generated from stories/recipes/windows-95 by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './Windows95Picker';

// In context: a retro desktop window.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="w95-window">
      <div className="w95-title">
        <span>Emoji Picker.exe</span>
        <button type="button" aria-label="Close">
          ×
        </button>
      </div>
      <PickerExample Root={RootComponent} className={className} />
    </div>
  );
}
