import React from 'react';

import { SkinTonePickerLocation } from '../../../src/primitives';
import * as Picker from '../../../src/primitives';

import './app.css';

// In context: a mobile app's "New habit" screen. Choosing an icon opens
// a bottom sheet with a header row, a horizontal tab strip and large
// tile-style emojis.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
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
          skinTonePickerLocation={SkinTonePickerLocation.NONE}
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
