import React from 'react';

import { Categories } from '../../../src/primitives';
import * as Picker from '../../../src/primitives';

// Icon chooser: categories are narrowed to the ones that make sense as
// icons. Wire onEmojiClick to apply the chosen icon in your own form.
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
  /** Apply `emoji.emoji` as the icon. Defaults to a no-op. */
  onEmojiClick?: (emoji: { emoji: string }) => void;
};

function noopEmojiClick() {}

export function PickerExample({
  Root: RootComponent = Picker.Root,
  className,
  onEmojiClick = noopEmojiClick,
}: PickerExampleProps) {
  return (
    <RootComponent
      appearance="default"
      className={className}
      searchPlaceholder="Search icons"
      autoFocusSearch={false}
      onEmojiClick={onEmojiClick}
      categories={[
        Categories.OBJECTS,
        Categories.ACTIVITIES,
        Categories.TRAVEL_PLACES,
        Categories.ANIMALS_NATURE,
        Categories.FOOD_DRINK,
        Categories.SYMBOLS,
      ]}
    >
      <div className="project-toolbar">
        <Picker.Search />
        <Picker.CategoryNav />
      </div>
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
    </RootComponent>
  );
}
