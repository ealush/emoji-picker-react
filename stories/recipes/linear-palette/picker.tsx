import React from 'react';

import * as Picker from '../../../src/primitives';

import './panel.css';

// No CategoryNav and no Preview: rendering only the parts you want is the
// whole configuration. Keyboard hints live in a consumer footer. Pass
// onClose to dismiss the panel on Escape.
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
  /** Dismiss the panel on Escape. Defaults to a no-op. */
  onClose?: () => void;
};

function noopClose() {}

export function PickerExample({
  Root: RootComponent = Picker.Root,
  className,
  onClose = noopClose,
}: PickerExampleProps) {
  return (
    <RootComponent
      appearance="default"
      className={className}
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
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
