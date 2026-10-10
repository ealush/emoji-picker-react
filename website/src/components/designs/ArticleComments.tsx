// Generated from stories/recipes/article-comments by scripts/portDesigns.mts.
// Do not edit; change the recipe and run `npm run designs`.
import React from 'react';

import EmojiPicker from 'emoji-picker-react';

import { PickerExample } from './ArticleCommentsPicker';

// In context: a comment thread under an article. Existing reactions show
// as count chips; "+" opens the compact reactions bar, which expands to
// the full picker.
export type ShellProps = {
  /** The picker root: EmojiPicker, or a styled() wrapper of it. */
  Root?: React.ComponentType<Omit<React.ComponentProps<typeof EmojiPicker>, 'theme'>>;
  className?: string;
};

const chips = [
  ['👍', 12, true],
  ['🎉', 4, false],
  ['💡', 3, false],
] as const;

export function Shell({ Root: RootComponent = EmojiPicker, className }: ShellProps) {
  return (
    <article className="comments-card">
      <h2 className="comments-title">3 comments</h2>
      <div className="comments-item">
        <span className="comments-avatar" aria-hidden>
          RK
        </span>
        <div className="comments-body">
          <p className="comments-meta">
            <strong>Rosa Kim</strong> · 2h ago
          </p>
          <p>
            The section on progressive enhancement finally made it click for
            me. Bookmarking this one.
          </p>
          <div className="comments-reactions">
            {chips.map(([emoji, count, mine]) => (
              <button
                key={emoji}
                type="button"
                className="comments-chip"
                aria-pressed={mine}
                aria-label={`${emoji} ${count} reactions`}
              >
                <span aria-hidden>{emoji}</span> {count}
              </button>
            ))}
            <button type="button" className="comments-chip comments-add" aria-label="Add reaction" aria-expanded="true">
              ＋
            </button>
          </div>
          <div className="comments-popover">
            <PickerExample Root={RootComponent} className={className} />
          </div>
        </div>
      </div>
    </article>
  );
}
