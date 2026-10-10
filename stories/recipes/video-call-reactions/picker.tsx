import React from 'react';

import EmojiPicker from '../../../src';

// Reactions float in a translucent dark pill above the call controls;
// "+" expands to a dark full picker.
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
      colorScheme="dark"
      reactionsDefaultOpen
      reactions={['1f44f', '1f44d', '2764-fe0f', '1f602', '1f62e', '1f389']}
      width={360}
      height={380}
    />
  );
}
