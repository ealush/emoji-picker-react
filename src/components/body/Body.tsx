import * as React from 'react';
import './Body.css';
import { EmojiList } from './EmojiList';

export function Body() {
  return (
    <div className="epr-body">
      <EmojiList />
    </div>
  );
}
