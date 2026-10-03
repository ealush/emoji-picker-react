import React from 'react';

import { SkinTonePickerLocation } from '../../../src';
import * as Picker from '../../../src/primitives';

import './app.css';

// The SkinTone primitive sits beside the search field in a consumer row
// (the built-in placement is turned off with NONE).
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent       className={className}
      searchPlaceholder="Search emojis"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <div className="x-header">
        <Picker.Search />
        <Picker.SkinTone />
      </div>
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
    </RootComponent>
  );
}
