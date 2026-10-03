// Generated from stories/recipes/video-call-reactions by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';


// In context: a video call. Reactions float in a translucent dark pill
// above the call controls; "+" expands to a dark full picker.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ElementType;
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
        <RootComponent
          className={className}
          colorScheme="dark"
          reactionsDefaultOpen
          reactions={['1f44f', '1f44d', '2764-fe0f', '1f602', '1f62e', '1f389']}
          width={360}
          height={380}
        />
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
