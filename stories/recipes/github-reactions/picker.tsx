import React from 'react';

import EmojiPicker from '../../../src';

// GitHub's fixed reaction set. allowExpandReactions={false} makes the
// compact bar terminal: there is no "+" and no full picker.
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
      reactions={[
        '1f44d',
        '1f44e',
        '1f604',
        '1f389',
        '1f615',
        '2764-fe0f',
        '1f680',
        '1f440',
      ]}
    />
  );
}
