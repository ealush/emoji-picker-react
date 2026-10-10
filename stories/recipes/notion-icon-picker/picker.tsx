import React from 'react';

import * as Picker from '../../../src/primitives';

import './panel.css';

// Panel chrome (tabs, Remove, Random) is ordinary consumer UI composed
// inside Root: the tabs switch views in a real product (here they are
// static), and category tabs move to the bottom just by rendering
// CategoryNav last.
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function PickerExample({
  Root: RootComponent = Picker.Root,
  className,
}: PickerExampleProps) {
  return (
    <RootComponent
      appearance="default"
      className={className}
      searchPlaceholder="Filter…"
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
