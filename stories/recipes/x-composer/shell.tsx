import React from 'react';

import * as Picker from '../../../src/primitives';

import './app.css';

// The SkinTone primitive sits beside the search field in a consumer row
// (presence and placement are defined entirely by this JSX).
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent appearance="default"       className={className}
      searchPlaceholder="Search emojis"
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
