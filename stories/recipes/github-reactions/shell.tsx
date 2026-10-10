import React from 'react';

import EmojiPicker from '../../../src';

import './app.css';
import { PickerExample } from './picker';

// In context: a comment on an issue. The fixed reaction set sits under
// the comment header.
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
      <PickerExample Root={RootComponent} className={className} />
    </div>
  );
}
