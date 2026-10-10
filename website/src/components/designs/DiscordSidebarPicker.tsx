// Generated from stories/recipes/discord-sidebar by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';


// A vertical category rail: CategoryNav is placed in its own column and
// orientation="vertical" stacks the tabs and moves keyboard navigation to
// Up/Down (announced through aria-orientation).
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
      searchPlaceholder="Find the perfect emoji"
    >
      <Picker.Panel>
        <div className="discord-layout">
          <div className="discord-rail">
            <Picker.CategoryNav orientation="vertical" />
          </div>
          <div className="discord-main">
            <Picker.Search>
              <Picker.SkinTone />
            </Picker.Search>
            <Picker.Viewport>
              <Picker.List />
              <Picker.Empty />
            </Picker.Viewport>
          </div>
        </div>
        <Picker.Preview />
      </Picker.Panel>
    </RootComponent>
  );
}
