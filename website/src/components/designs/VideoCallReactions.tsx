// Generated from stories/recipes/video-call-reactions by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';

import { PickerExample } from './VideoCallReactionsPicker';

// In context: a video call.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
  className?: string;
};

export function Shell({ Root: RootComponent = EmojiPicker, className }: ShellProps) {
  return (
    <div className="call-stage">
      <div className="call-grid">
        <div className="call-tile call-tile-a">
          <span className="call-name">Priya (presenting)</span>
        </div>
        <div className="call-tile call-tile-b">
          <span className="call-name">Leo</span>
        </div>
      </div>
      <div className="call-reactions">
        <PickerExample Root={RootComponent} className={className} />
      </div>
      <div className="call-controls" role="toolbar" aria-label="Call controls">
        <button type="button" aria-label="Mute">🎙️</button>
        <button type="button" aria-label="Stop video">📷</button>
        <button type="button" aria-label="Share screen">🖥️</button>
        <button type="button" aria-label="Reactions" aria-pressed="true" className="call-active">
          😊
        </button>
        <button type="button" className="call-leave">Leave</button>
      </div>
    </div>
  );
}
