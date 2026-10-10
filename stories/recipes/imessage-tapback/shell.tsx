import React from 'react';

import EmojiPicker from '../../../src';

import './app.css';
import { PickerExample } from './picker';

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
