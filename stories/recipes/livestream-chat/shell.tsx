import React from 'react';

import { SkinTonePickerLocation } from '../../../src/primitives';
import * as Picker from '../../../src/primitives';

import './app.css';

// In context: a live stream with a chat column. The picker docks under
// the chat log at the column's full width — a short panel with tabs on
// top and a compact grid.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

const messages = [
  ['nightowl', '#f472b6', 'that combo was clean'],
  ['pixelpush', '#60a5fa', 'GG chat'],
  ['mod_sam', '#34d399', 'reminder: be kind in chat'],
  ['retrojen', '#fbbf24', 'clip it!!'],
];

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  return (
    <div className="stream-layout">
      <section className="stream-video" aria-label="Stream">
        <span className="stream-live">LIVE</span>
        <div className="stream-meta">
          <strong>Speedrun Sunday — any% PB attempts</strong>
          <span>12.4k watching</span>
        </div>
      </section>
      <aside className="stream-chat" aria-label="Stream chat">
        <h2 className="stream-chat-title">Stream chat</h2>
        <ul className="stream-log">
          {messages.map(([user, color, text]) => (
            <li key={user}>
              <strong style={{ color }}>{user}</strong> {text}
            </li>
          ))}
        </ul>
        <RootComponent
          className={className}
          searchPlaceholder="Search emotes and emoji"
          skinTonePickerLocation={SkinTonePickerLocation.NONE}
          autoFocusSearch={false}
        >
          <Picker.CategoryNav />
          <Picker.Search />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
        </RootComponent>
        <div className="stream-input" role="textbox" aria-label="Send a message">
          Send a message
        </div>
      </aside>
    </div>
  );
}
