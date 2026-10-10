// Generated from stories/recipes/imessage-tapback by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';

import { PickerExample } from './IMessageTapbackPicker';

// In context: a message bubble with a tapback row.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
  className?: string;
};

export function Shell({ Root: RootComponent = EmojiPicker, className }: ShellProps) {
  return (
    <div className="imessage-stage">
      <PickerExample Root={RootComponent} className={className} />
      <div className="imessage-bubble">Dinner at 8? I booked the place by the river.</div>
    </div>
  );
}
