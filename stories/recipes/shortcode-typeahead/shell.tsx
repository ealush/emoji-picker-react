import React from 'react';

import { SkinTonePickerLocation } from '../../../src';
import * as Picker from '../../../src/primitives';

import './app.css';

// In context: typing ":party" in a comment box opens an autocomplete
// strip. There is no Search part — the app's own text drives the picker
// through the controlled `searchValue` — and no tabs or section titles.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

function Hint() {
  const active = Picker.useActiveEmoji();
  return (
    <div className="typeahead-hint">
      <span className="typeahead-name">
        {active ? active.names[active.names.length - 1] : 'Emoji matching “party”'}
      </span>
      <span>↵ insert · esc dismiss</span>
    </div>
  );
}

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="typeahead-card">
      <p className="typeahead-label">Reply to #142</p>
      <div className="typeahead-box" role="textbox" aria-label="Reply">
        Shipped the fix to production :party<span className="typeahead-caret" aria-hidden />
      </div>
      <RootComponent
        className={className}
        searchValue="party"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
        autoFocusSearch={false}
      >
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty />
        </Picker.Viewport>
        <Hint />
      </RootComponent>
    </div>
  );
}
