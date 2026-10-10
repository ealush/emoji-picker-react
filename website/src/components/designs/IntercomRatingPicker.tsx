// Generated from stories/recipes/intercom-rating by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';

// Reactions as a rating scale: a terminal bar (no "+") stretched to the
// card width. onReactionClick receives the chosen point on the scale.
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
      allowExpandReactions={false}
      reactions={['1f620', '1f641', '1f610', '1f603', '1f929']}
      onReactionClick={() => undefined}
    />
  );
}
