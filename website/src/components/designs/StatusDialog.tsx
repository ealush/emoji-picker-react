// Generated from stories/recipes/status-dialog by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';

import { PickerExample } from './StatusDialogPicker';

// In context: a "Set a status" dialog. The picker is an inline part of
// the form.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="status-backdrop">
      <div className="status-dialog" role="dialog" aria-labelledby="status-title">
        <h2 id="status-title" className="status-title">
          Set a status
        </h2>
        <div className="status-field">
          <span className="status-current" aria-hidden>
            🌴
          </span>
          <span className="status-text">On vacation until Monday</span>
        </div>
        <PickerExample Root={RootComponent} className={className} />
        <div className="status-row">
          <span>Clear after</span>
          <span className="status-select">Today ▾</span>
        </div>
        <div className="status-actions">
          <button type="button">Cancel</button>
          <button type="button" className="status-save">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
