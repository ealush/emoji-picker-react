import React, { useRef, useState } from 'react';

import * as Picker from '../../../src/primitives';

import './app.css';
import { PickerExample } from './picker';

export type ShellProps = { Root?: React.ComponentType<Picker.RootProps>; className?: string };

// Name autocomplete triggered by ':', not a Slack shortcode resolver.
export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  const [text, setText] = useState('Shipped the fix to production :party');
  const [caret, setCaret] = useState(text.length);
  const [dismissed, setDismissed] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLDivElement>(null);
  const match = /(?:^|\s):([^\s:]+)$/.exec(text.slice(0, caret));
  const query = match?.[1] ?? '';
  const open = !!query && !dismissed;

  function insert(emoji: Picker.EmojiClickData) {
    const start = caret - query.length - 1;
    const nextCaret = start + emoji.emoji.length;
    setText(text.slice(0, start) + emoji.emoji + text.slice(caret));
    setCaret(nextCaret);
    setDismissed(true);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(nextCaret, nextCaret);
    });
  }

  return <div className="typeahead-card" onKeyDown={(event) => {
    if (event.key === 'Escape' && open) {
      event.preventDefault(); setDismissed(true); input.current?.focus();
    }
  }}>
    <p className="typeahead-label">Reply to #142</p>
    <textarea ref={input} className="typeahead-box" rows={1} aria-label="Reply"
      value={text}
      onChange={(event) => {
        setText(event.target.value); setCaret(event.target.selectionStart); setDismissed(false);
      }}
      onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
      onKeyDown={(event) => {
        if (open && event.key === 'ArrowDown') {
          const first = Array.from(picker.current?.querySelectorAll<HTMLButtonElement>('[role="gridcell"]') ?? [])
            .find((cell) => cell.getClientRects().length > 0);
          if (first) { event.preventDefault(); first.focus(); }
        }
      }} />
    {open && <div ref={picker}>
      <PickerExample
        Root={RootComponent}
        className={className}
        searchValue={query}
        onEmojiClick={insert}
      />
    </div>}
  </div>;
}
