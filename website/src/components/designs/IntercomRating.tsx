// Generated from stories/recipes/intercom-rating by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';

import { PickerExample } from './IntercomRatingPicker';

// In context: a support chat widget asking for a rating.
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
        <PickerExample Root={RootComponent} className={className} />
      </div>
    </div>
  );
}
