import { getEmojiByUnified, searchEmojis } from 'emoji-picker-react/data';
import { useMemo, useState } from 'react';

type Props = { onPick: (message: string) => void };

// Unified codes are hyphen-separated hex code points.
const toNative = (unified: string) =>
  String.fromCodePoint(...unified.split('-').map((hex) => parseInt(hex, 16)));

// Names are search keywords in dataset order; the full name comes last.
const displayName = (names: readonly string[]) => names[names.length - 1];

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
                  `${toNative(emoji.unified)}  ${displayName(info?.names ?? emoji.names)}  (${emoji.unified}, Emoji ${info?.addedIn})`,
                );
              }}
            >
              <span aria-hidden>{toNative(emoji.unified)}</span>
              {displayName(emoji.names)}
            </button>
          </li>
        ))}
        {results.length === 0 && <li>No match.</li>}
      </ul>
    </div>
  );
}
