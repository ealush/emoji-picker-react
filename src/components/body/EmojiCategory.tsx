import * as React from 'react';
import { DataGroups } from '../../dataUtils/DataTypes';
import emojisByCategory from '../../dataUtils/emojisByCategory';
import { useRef } from 'react';
import './EmojiCategory.css';
import { useIsEmojiFiltered } from '../../hooks/useFilter';
import { emojiUnified } from '../../dataUtils/emojiSelectors';
import { Emoji } from '../emoji/Emoji';

type Props = Readonly<{
  category: DataGroups;
}>;

export function EmojiCategory({ category }: Props) {
  const visibleEmojiCounter = useRef(0);
  const emojis = emojisByCategory(category);

  visibleEmojiCounter.current = 0;

  return (
    <li className="epr-emoji-category" data-name={category}>
      <div className="epr-emoji-category-label">{category}</div>
      {emojis.map(emoji => {
        const hidden = useIsEmojiFiltered(emojiUnified(emoji));

        if (!hidden) {
          visibleEmojiCounter.current++;
        }

        return (
          <Emoji
            key={emoji.u}
            emoji={emoji}
            hidden={hidden}
            index={visibleEmojiCounter.current}
          />
        );
      })}
    </li>
  );
}
