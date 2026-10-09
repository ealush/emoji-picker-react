import React from 'react';

import EmojiPicker from '../../../src';

import './app.css';

// The default picker in reactions mode with Slack's common reaction set.
// The "+" expands to the full picker in place.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<React.ComponentProps<typeof EmojiPicker>>;
  className?: string;
};

export function Shell({ Root: RootComponent = EmojiPicker, className }: ShellProps) {
  return (
    <div className="slack-stage">
      <div className="slack-message">
        <div className="slack-avatar" />
        <div>
          <span className="slack-name">Ana Ramírez</span>
          <div>Shipped the release notes — take a look before standup 🚀</div>
        </div>
      </div>
      <RootComponent         className={className}
        reactionsDefaultOpen
        reactions={['2705', '1f440', '1f64c', '1f525', '1f389', '1f44d']}
        width={420}
        height={380}
      />
    </div>
  );
}
