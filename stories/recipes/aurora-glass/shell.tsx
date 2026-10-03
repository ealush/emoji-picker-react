import React from 'react';

import { SkinTonePickerLocation } from '../../../src';
import * as Picker from '../../../src/primitives';

import './app.css';

// Concept: frosted glass floating over a night-sky aurora. Search sits on
// top, the category tabs float in a pill dock at the bottom, and the
// emoji grid scrolls behind the dock.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="aurora-sky">
      <div className="aurora-blob aurora-blob-a" />
      <div className="aurora-blob aurora-blob-b" />
      <div className="aurora-blob aurora-blob-c" />
      <RootComponent
        className={className}
        searchPlaceholder="Search the sky"
        skinTonePickerLocation={SkinTonePickerLocation.NONE}
      >
        <Picker.Search />
        <Picker.Viewport>
          <Picker.List />
          <Picker.Empty />
        </Picker.Viewport>
        <div className="aurora-dock">
          <Picker.CategoryNav />
        </div>
      </RootComponent>
    </div>
  );
}
