// Generated from stories/recipes/linear-palette by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React, { useState } from 'react';

import * as Picker from 'emoji-picker-react/primitives';


// No CategoryNav and no Preview: rendering only the parts you want is the
// whole configuration. Keyboard hints live in a consumer footer.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  const [open, setOpen] = useState(true);
  if (!open) return <button type="button" onClick={() => setOpen(true)}>Open emoji picker</button>;
  return (
    <RootComponent appearance="default"       className={className}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === 'Escape') setOpen(false);
      }}
      searchPlaceholder="Search emoji…"
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
