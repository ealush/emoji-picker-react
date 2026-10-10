import React from 'react';

import EmojiPicker from '../../../src';

import './app.css';
import { PickerExample } from './picker';

// In context: a chat message with Slack's reaction set under it.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
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
      <PickerExample Root={RootComponent} className={className} />
    </div>
  );
}
