import React from 'react';

import * as Picker from '../../../src/primitives';

import './app.css';

// A vertical category rail: CategoryNav is placed in its own column and
// orientation="vertical" stacks the tabs and moves keyboard navigation to
// Up/Down (announced through aria-orientation).
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent className={className} searchPlaceholder="Find the perfect emoji">
      <div className="discord-layout">
        <div className="discord-rail">
          <Picker.CategoryNav orientation="vertical" />
        </div>
        <div className="discord-main">
          <Picker.Search />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
        </div>
      </div>
      <Picker.Preview />
    </RootComponent>
  );
}
