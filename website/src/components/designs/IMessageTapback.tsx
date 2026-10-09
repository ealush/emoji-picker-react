// Generated from stories/recipes/imessage-tapback by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';


// Tapback set: love, like, dislike, laugh, emphasize, question.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
  className?: string;
};

export function Shell({ Root: RootComponent = EmojiPicker, className }: ShellProps) {
  return (
    <div className="imessage-stage">
      <RootComponent         className={className}
        colorScheme="dark"
        reactionsDefaultOpen
        reactions={['2764-fe0f', '1f44d', '1f44e', '1f602', '203c-fe0f', '2753']}
      />
      <div className="imessage-bubble">Dinner at 8? I booked the place by the river.</div>
    </div>
  );
}
