import * as React from 'react';
import { emojiVariations } from '../../dataUtils/emojiSelectors';
import { useEmojiStyleConfig } from '../context/PickerConfigContext';
import { useEmojiVariationPickerState } from '../context/PickerContext';
import { Emoji } from '../emoji/Emoji';
import './EmojiVariationPicker.css';

export function EmojiVariationPicker() {
  const [emoji] = useEmojiVariationPickerState();
  const emojiStyle = useEmojiStyleConfig();

  if (!emoji) {
    return null;
  }

  const variations = emojiVariations(emoji);

  return (
    <div className="epr-emoji-variation-picker">
      {variations.map(unified => (
        <Emoji
          key={unified}
          emoji={emoji}
          unified={unified}
          emojiStyle={emojiStyle}
          disableTip
        />
      ))}
    </div>
  );
}
