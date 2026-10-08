import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';
import { useState } from 'react';

import './batteries.css';

type Props = { onPick: (message: string) => void };

/**
 * The one-line picker. No stylesheet import: its CSS is injected once per
 * document and scoped to the picker. `colorScheme` and the `--epr-*`
 * variables on `.brand-picker` theme the built-in look.
 */
export function BatteriesIncluded({ onPick }: Props) {
  const [scheme, setScheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [branded, setBranded] = useState(false);

  function handleClick(data: EmojiClickData) {
    onPick(`${data.emoji}  ${data.names[data.names.length - 1]}  (${data.unified})`);
  }

  return (
    <div className="example">
      <div className="example-controls">
        <label>
          Color scheme{' '}
          <select
            value={scheme}
            onChange={(event) =>
              setScheme(event.target.value as 'light' | 'dark' | 'auto')
            }
          >
            <option value="auto">auto</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={branded}
            onChange={(event) => setBranded(event.target.checked)}
          />{' '}
          Brand variables
        </label>
      </div>

      <EmojiPicker
        colorScheme={scheme}
        className={branded ? 'brand-picker' : undefined}
        columns={8}
        onEmojiClick={handleClick}
      />
    </div>
  );
}
