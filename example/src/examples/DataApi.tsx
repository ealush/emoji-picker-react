import { getEmojiByUnified, searchEmojis } from 'emoji-picker-react/data';
import { useMemo, useState } from 'react';

type Props = { onPick: (message: string) => void };

/**
 * No React component, no styles: the same index the picker uses, as plain
 * functions. Works in a Server Component, a route handler or a worker.
 */
export function DataApi({ onPick }: Props) {
  const [query, setQuery] = useState('party');
  const results = useMemo(() => searchEmojis(query).slice(0, 24), [query]);

  return (
    <div className="example">
      <label className="data-search">
        searchEmojis(
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search query"
        />
        )
      </label>
      <ul className="data-results">
        {results.map((emoji) => (
          <li key={emoji.unified}>
            <button
              type="button"
              onClick={() => {
                const info = getEmojiByUnified(emoji.unified);
                onPick(
                  `${emoji.emoji}  ${emoji.name}  (${emoji.unified}, Emoji ${info?.addedIn})`,
                );
              }}
            >
              <span aria-hidden>{emoji.emoji}</span>
              {emoji.name}
            </button>
          </li>
        ))}
        {results.length === 0 && <li>No match.</li>}
      </ul>
    </div>
  );
}
