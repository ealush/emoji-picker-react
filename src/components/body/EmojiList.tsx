import * as React from 'react';
import categories from '../../dataUtils/categories';
import { EmojiCategory } from './EmojiCategory';
import './EmojiList.css';

interface Props { 
  emojiListRef: any;
}

export function EmojiList({ emojiListRef } : Props) {
  return (
    <ul className="epr-emoji-list" ref={emojiListRef}>
      {categories.map(category => (
        <EmojiCategory category={category} key={category} />
      ))}
    </ul>
  );
}
