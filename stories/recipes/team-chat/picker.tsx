import React from 'react';

import * as Picker from '../../../src/primitives';

// Chat composer popover picker: search with the skin tone control, tabs,
// the grid and a slim preview strip. Wire onEmojiClick to insert the
// chosen emoji into your own composer.
export type PickerExampleProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
  /** Insert `emoji.emoji` into your app. Defaults to a no-op. */
  onEmojiClick?: (emoji: Picker.EmojiClickData) => void;
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
      onEmojiClick={onEmojiClick}
    >
      <Picker.Search>
        <Picker.SkinTone />
      </Picker.Search>
      <Picker.CategoryNav />
      <Picker.Viewport>
        <Picker.List />
        <Picker.Empty />
      </Picker.Viewport>
      <Picker.Preview />
    </RootComponent>
  );
}
