import * as React from 'react';
import { DataEmojis, DataGroups } from '../../dataUtils/DataTypes';
import './EmojiCategory.css';
import { Emoji } from '../emoji/Emoji';
import { categoryName } from '../../dataUtils/categorySelector';

type Props = Readonly<{
  category: DataGroups;
  emojis: DataEmojis;
}>;

export function EmojiCategory({ category, emojis }: Props) {
  return (
    <li className="epr-emoji-category" data-name={category}>
      <div className="epr-emoji-category-label">{categoryName(category)}</div>
      {emojis.map(emoji => {
        return <Emoji key={emoji.u} emoji={emoji} />;
      })}
    </li>
  );
}
