// Generated from stories/recipes/habit-tracker-mobile by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';


// In context: a mobile app's "New habit" screen. Choosing an icon opens
// a bottom sheet with a header row, a horizontal tab strip and large
// tile-style emojis.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="habit-phone">
      <div className="habit-screen">
        <p className="habit-back">‹ Habits</p>
        <h2 className="habit-title">New habit</h2>
        <div className="habit-field">
          <span className="habit-icon" aria-hidden>
            💧
          </span>
          <span>Drink water</span>
        </div>
        <p className="habit-sub">8 glasses · every day</p>
      </div>
      <div className="habit-sheet">
        <div className="habit-sheet-handle" aria-hidden />
        <div className="habit-sheet-header">
          <h3>Choose an icon</h3>
          <button type="button">Done</button>
        </div>
        <RootComponent appearance="default"
          className={className}
          searchPlaceholder="Search"
          autoFocusSearch={false}
        >
          <Picker.Search />
          <Picker.CategoryNav />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
        </RootComponent>
      </div>
    </div>
  );
}
