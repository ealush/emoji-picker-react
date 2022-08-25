import * as React from 'react';
import { DataEmojis, DataGroups } from '../../dataUtils/DataTypes';
import './EmojiCategory.css';
import { Emoji } from '../emoji/Emoji';
import { categoryName } from '../../dataUtils/categorySelector';
import { emojiUnified } from '../../dataUtils/emojiSelectors';
import { useActiveSkinToneState } from '../context/PickerContext';
import { useIsEmojiHidden } from '../../hooks/useIsEmojiHidden';
import { useNativeConfig } from '../context/PickerConfigContext';

type Props = Readonly<{
  category: DataGroups;
  emojis: DataEmojis;
}>;

export function EmojiCategory({ category, emojis }: Props) {
  const native = useNativeConfig();
  const [activeSkinTone] = useActiveSkinToneState();
  const isEmojiHidden = useIsEmojiHidden();

  return (
    <li className="epr-emoji-category" data-name={category}>
      <div className="epr-emoji-category-label">{categoryName(category)}</div>
      {emojis.map(emoji => {
        const unified = emojiUnified(emoji, activeSkinTone);
        const hidden = isEmojiHidden(emoji);

        return (
          <Emoji
            key={unified}
            emoji={emoji}
            unified={unified}
            hidden={hidden}
            native={native}
          />
        );
      })}
    </li>
  );
}
