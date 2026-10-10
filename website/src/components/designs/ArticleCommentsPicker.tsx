// Generated from stories/recipes/article-comments by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';

// Compact reactions bar that expands to the full picker.
export type PickerExampleProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
  className?: string;
};

export function PickerExample({
  Root: RootComponent = EmojiPicker,
  className,
}: PickerExampleProps) {
  return (
    <RootComponent
      className={className}
      reactionsDefaultOpen
      reactions={['1f44d', '2764-fe0f', '1f602', '1f389', '1f914', '1f440', '1f525']}
      width={360}
      height={400}
    />
  );
}
