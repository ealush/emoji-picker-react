import React from 'react';

import EmojiPicker from '../../../src';

import './app.css';

// GitHub's fixed reaction set. allowExpandReactions={false} makes the
// compact bar terminal: there is no "+" and no full picker.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
  className?: string;
};

export function Shell({ Root: RootComponent = EmojiPicker, className }: ShellProps) {
  return (
    <div className="gh-stage">
      <div className="gh-comment-header">
        <strong>octocat</strong> commented 3 hours ago
      </div>
      Repro is attached. Happens on every cold start since 2.4.0.
      <div className="gh-popover-label">Pick your reaction</div>
      <RootComponent         className={className}
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
    </div>
  );
}
