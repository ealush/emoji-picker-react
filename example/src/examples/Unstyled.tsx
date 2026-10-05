import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react';

import './unstyled.css';

type Props = { onPick: (message: string) => void };

/**
 * `unstyled` keeps the supplied composition (search, tabs, grid, preview)
 * and every behavior, but removes all decorative styling. unstyled.css
 * styles the stable `[data-epr-part]` selectors from scratch; color
 * variables have no effect in this mode.
 */
export function Unstyled({ onPick }: Props) {
  function handleClick(data: EmojiClickData) {
    onPick(`${data.emoji}  ${data.names[data.names.length - 1]}  (${data.unified})`);
  }

  return (
    <div className="example">
      <EmojiPicker
        unstyled
        className="paper-picker"
        width={360}
        height={440}
        searchPlaceholder="Search emoji"
        onEmojiClick={handleClick}
      />
    </div>
  );
}
