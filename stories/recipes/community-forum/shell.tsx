import React, { useRef, useState } from 'react';

import * as Picker from '../../../src/primitives';

import './app.css';
import { PickerExample } from './picker';

// In context: a community forum reply.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ComponentType<Picker.RootProps>;
  className?: string;
};

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  const [reply, setReply] = useState('Huge release, congrats team');
  const input = useRef<HTMLTextAreaElement>(null);
  function insertEmoji(emoji: Picker.EmojiClickData) {
    const start = input.current?.selectionStart ?? reply.length;
    const end = input.current?.selectionEnd ?? start;
    const insertion = emoji.isCustom ? `:${emoji.unified}:` : emoji.emoji;
    setReply(reply.slice(0, start) + insertion + reply.slice(end));
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(
        start + insertion.length,
        start + insertion.length,
      );
    });
  }
  return (
    <div className="forum-thread">
      <div className="forum-post">
        <span className="forum-tag">Release notes</span>
        <h2>v3.2 is out — faster builds and a new plugin API</h2>
        <p className="forum-byline">posted by @kai · 41 replies</p>
      </div>
      <div className="forum-reply">
        <span className="forum-reply-label">Your reply</span>
        <textarea
          ref={input}
          className="forum-editor"
          aria-label="Reply"
          rows={1}
          value={reply}
          onChange={(event) => setReply(event.target.value)}
        />
        <PickerExample
          Root={RootComponent}
          className={className}
          onEmojiClick={insertEmoji}
        />
      </div>
    </div>
  );
}
