// Generated from stories/recipes/team-chat by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import * as Picker from 'emoji-picker-react/primitives';


// In context: a team chat channel. The picker opens as a popover anchored
// above the composer's emoji button — search with the skin tone control,
// tabs, the grid and a slim preview strip.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="chat-window">
      <header className="chat-header">
        <span className="chat-channel"># design-crit</span>
        <span className="chat-members">8 members</span>
      </header>
      <ul className="chat-messages">
        <li className="chat-message">
          <span className="chat-avatar chat-avatar-a" aria-hidden />
          <div>
            <p className="chat-meta">
              <strong>Maya Chen</strong> 10:42 AM
            </p>
            <p>New onboarding flow is up on staging, feedback welcome!</p>
          </div>
        </li>
        <li className="chat-message">
          <span className="chat-avatar chat-avatar-b" aria-hidden />
          <div>
            <p className="chat-meta">
              <strong>Jonah Price</strong> 10:44 AM
            </p>
            <p>The empty states are so much friendlier now.</p>
          </div>
        </li>
      </ul>
      <div className="chat-popover">
        <RootComponent className={className}>
          <Picker.Search />
          <Picker.CategoryNav />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
          <Picker.Preview />
        </RootComponent>
      </div>
      <div className="chat-composer">
        <div className="chat-input" role="textbox" aria-label="Message #design-crit">
          Love the new onboarding flow
        </div>
        <div className="chat-tools">
          <button type="button" aria-label="Attach file">＋</button>
          <button type="button" aria-label="Emoji" aria-pressed="true" className="chat-emoji-button">
            ☺
          </button>
          <button type="button" className="chat-send">Send</button>
        </div>
      </div>
    </div>
  );
}
