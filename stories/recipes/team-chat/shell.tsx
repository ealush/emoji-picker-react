import React, { useRef, useState } from 'react';

import * as Picker from '../../../src/primitives';

import './app.css';

// In context: a team chat channel. The picker opens as a popover anchored
// above the composer's emoji button — search with the skin tone control,
// tabs, the grid and a slim preview strip.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  const [message, setMessage] = useState('Love the new onboarding flow');
  const [open, setOpen] = useState(true);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
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
      {open && <div className="chat-popover" onKeyDown={(event) => {
        if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
      }}>
        <RootComponent appearance="default" className={className} onEmojiClick={(emoji: Picker.EmojiClickData) => {
          const start = input.current?.selectionStart ?? message.length;
          const end = input.current?.selectionEnd ?? start;
          setMessage(message.slice(0, start) + emoji.emoji + message.slice(end));
          setOpen(false);
          requestAnimationFrame(() => { input.current?.focus(); input.current?.setSelectionRange(start + emoji.emoji.length, start + emoji.emoji.length); });
        }}>
          <Picker.Search />
          <Picker.CategoryNav />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
          <Picker.Preview />
        </RootComponent>
      </div>}
      <div className="chat-composer">
        <input ref={input} className="chat-input" aria-label="Message #design-crit"
          value={message} onChange={(event) => setMessage(event.target.value)} />
        <div className="chat-tools">
          <button type="button" aria-label="Attach file">＋</button>
          <button ref={trigger} type="button" aria-label="Emoji" aria-expanded={open} className="chat-emoji-button" onClick={() => setOpen(!open)}>
            ☺
          </button>
          <button type="button" className="chat-send">Send</button>
        </div>
      </div>
    </div>
  );
}
