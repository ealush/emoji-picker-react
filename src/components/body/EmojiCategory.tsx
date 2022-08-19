import * as React from 'react';
import { DataGroups } from '../../dataUtils/DataTypes';
import emojisByCategory from '../../dataUtils/emojisByCategory';
import { Emoji } from './Emoji';
import './EmojiCategory.css';

type Props = Readonly<{
  category: DataGroups;
}>;

export function EmojiCategory({ category }: Props) {
  const emojis = emojisByCategory(category);
  return (
    <li data-name={category} className="epr-emoji-category">
      {emojis.map(emoji => (
        <Emoji key={emoji.u} emoji={emoji} />
      ))}
    </li>
  );
}
