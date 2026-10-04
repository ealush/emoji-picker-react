// Generated from stories/recipes/community-forum by scripts/portDesigns.mjs.
// Do not edit; change the recipe and run `npm run designs`.
import React, { useRef, useState } from 'react';

import { Categories } from 'emoji-picker-react/primitives';
import * as Picker from 'emoji-picker-react/primitives';


// In context: a community forum reply. The community's own custom
// emojis come first in their own group (customEmojis), then the standard
// set. Badges are inline SVG data URIs — no network.
export type ShellProps = {
  /** The picker root: Picker.Root, or a styled() wrapper of it. */
  Root?: React.ElementType;
  className?: string;
};

function badge(label: string, background: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="16" fill="${background}"/><text x="32" y="40" font-family="Arial, sans-serif" font-size="${label.length > 3 ? 15 : 20}" font-weight="700" fill="#fff" text-anchor="middle">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const community = [
  ['lgtm', 'LGTM', '#16a34a', ['looks good to me']],
  ['ship', 'SHIP', '#2563eb', ['ship it']],
  ['wip', 'WIP', '#d97706', ['work in progress']],
  ['plus1', '+1', '#7c3aed', ['plus one', 'agree']],
  ['nice', 'NICE', '#db2777', ['nice']],
  ['ack', 'ACK', '#0891b2', ['acknowledged']],
].map(([id, label, color, names]) => ({
  id: id as string,
  names: names as string[],
  imgUrl: badge(label as string, color as string),
  group: 'community',
}));

export function Shell({ Root: RootComponent = Picker.Root, className }: ShellProps) {
  const [reply, setReply] = useState('Huge release, congrats team');
  const input = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="forum-thread">
      <div className="forum-post">
        <span className="forum-tag">Release notes</span>
        <h2>v3.2 is out — faster builds and a new plugin API</h2>
        <p className="forum-byline">posted by @kai · 41 replies</p>
      </div>
      <div className="forum-reply">
        <span className="forum-reply-label">Your reply</span>
        <textarea ref={input} className="forum-editor" aria-label="Reply" rows={1}
          value={reply} onChange={(event) => setReply(event.target.value)} />
        <RootComponent
          className={className}
          customEmojis={community}
          onEmojiClick={(emoji: Picker.EmojiClickData) => {
            const start = input.current?.selectionStart ?? reply.length;
            const end = input.current?.selectionEnd ?? start;
            const insertion = emoji.isCustom ? `:${emoji.unified}:` : emoji.emoji;
            setReply(reply.slice(0, start) + insertion + reply.slice(end));
            requestAnimationFrame(() => {
              input.current?.focus(); input.current?.setSelectionRange(start + insertion.length, start + insertion.length);
            });
          }}
          categories={[
            { category: Categories.CUSTOM, group: 'community', name: 'Community' },
            Categories.SUGGESTED,
            Categories.SMILEYS_PEOPLE,
            Categories.ANIMALS_NATURE,
            Categories.FOOD_DRINK,
            Categories.ACTIVITIES,
            Categories.OBJECTS,
            Categories.SYMBOLS,
          ]}
          searchPlaceholder="Search community and standard emoji"
          autoFocusSearch={false}
        >
          <Picker.Search />
          <Picker.CategoryNav />
          <Picker.Viewport>
            <Picker.List />
            <Picker.Empty />
          </Picker.Viewport>
        </RootComponent>
      </div>
    </div>
  );
}
