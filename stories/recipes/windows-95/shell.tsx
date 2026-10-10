import React from 'react';

import * as Picker from '../../../src/primitives';

import './app.css';
import { PickerExample } from './picker';

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
