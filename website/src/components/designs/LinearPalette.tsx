// Generated from stories/recipes/linear-palette by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import { SkinTonePickerLocation } from 'emoji-picker-react';
import * as Picker from 'emoji-picker-react/primitives';


// No CategoryNav and no Preview: rendering only the parts you want is the
// whole configuration. Keyboard hints live in a consumer footer.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <RootComponent       className={className}
      searchPlaceholder="Search emoji…"
      skinTonePickerLocation={SkinTonePickerLocation.NONE}
    >
      <Picker.Search />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty className="linear-empty">
          {({ search }) => `No emoji matches “${search}”`}
        </Picker.Empty>
      </Picker.Viewport>
      <footer className="linear-footer">
        <span>
          <kbd>↑↓←→</kbd> navigate
        </span>
        <span>
          <kbd>↵</kbd> insert
        </span>
        <span>
          <kbd>esc</kbd> close
        </span>
      </footer>
    </RootComponent>
  );
}
