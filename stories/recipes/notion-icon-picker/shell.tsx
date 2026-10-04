import React from 'react';

import { SkinTonePickerLocation } from '../../../src/primitives';
import * as Picker from '../../../src/primitives';

import './app.css';

// App chrome (tabs, Remove, Random) is ordinary consumer UI inside Root.
// Category tabs move to the bottom just by rendering CategoryNav last.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent       className={className}
      searchPlaceholder="Filter…"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <div className="notion-tabs">
        <button type="button" aria-pressed="true">
          Emoji
        </button>
        <button type="button" aria-pressed="false">
          Icons
        </button>
        <button type="button" aria-pressed="false">
          Upload
        </button>
        <button type="button" className="notion-remove">
          Remove
        </button>
      </div>
      <div className="notion-search-row">
        <Picker.Search />
        <button type="button" className="notion-random">
          🎲 Random
        </button>
      </div>
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.CategoryNav />
    </RootComponent>
  );
}
