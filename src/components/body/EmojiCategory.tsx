import * as React from 'react';
import { DataEmojis, DataGroups } from '../../dataUtils/DataTypes';
import './EmojiCategory.css';
import { Emoji } from '../emoji/Emoji';
import { categoryName } from '../../dataUtils/categorySelector';
import { emojiUnified } from '../../dataUtils/emojiSelectors';
import { useActiveSkinToneState } from '../contextProvider/PickerContextProvider';
import { useIsEmojiFiltered } from '../../hooks/useFilter';

type Props = Readonly<{
  category: DataGroups;
  emojis: DataEmojis;
}>;

export function EmojiCategory({ category, emojis }: Props) {
  const [activeSkinTone] = useActiveSkinToneState();
  const isEmojiFiltered = useIsEmojiFiltered();

  return (
    <li className="epr-emoji-category" data-name={category}>
      <div className="epr-emoji-category-label">{categoryName(category)}</div>
      {emojis.map(emoji => {
        const unified = emojiUnified(emoji, activeSkinTone);
        const isFiltered = isEmojiFiltered(unified);
        return (
          <Emoji
            key={unified}
            emoji={emoji}
            unified={unified}
            filtered={isFiltered}
          />
        );
      })}
    </li>
  );
}
