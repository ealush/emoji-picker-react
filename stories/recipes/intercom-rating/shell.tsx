import React from 'react';

import EmojiPicker from '../../../src';

import './app.css';

// Reactions as a rating scale: a terminal bar (no "+") stretched to the
// card width. onReactionClick receives the chosen point on the scale.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
  className?: string;
};

export function Shell({ Root: RootComponent = EmojiPicker, className }: ShellProps) {
  return (
    <div className="intercom-widget">
      <div className="intercom-header">
        <h2>Hi there 👋</h2>
        <p>We typically reply in a few minutes.</p>
      </div>
      <div className="intercom-card">
        <strong>How would you rate the conversation?</strong>
        <RootComponent           className={className}
          reactionsDefaultOpen
          allowExpandReactions={false}
          reactions={['1f620', '1f641', '1f610', '1f603', '1f929']}
          onReactionClick={() => undefined}
        />
      </div>
    </div>
  );
}
