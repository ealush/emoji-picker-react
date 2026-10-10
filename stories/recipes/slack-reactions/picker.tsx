import React from 'react';

import EmojiPicker from '../../../src';

// The default picker in reactions mode with Slack's common reaction set.
// The "+" expands to the full picker in place.
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
      reactions={['2705', '1f440', '1f64c', '1f525', '1f389', '1f44d']}
      width={420}
      height={380}
    />
  );
}
