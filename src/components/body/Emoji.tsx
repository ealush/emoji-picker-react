import * as React from 'react';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiUrl } from '../../dataUtils/emojiSelectors';
import './Emoji.css';

type Props = Readonly<{
  emoji: DataEmoji;
}>;

export function Emoji({ emoji }: Props) {
  return (
    <button className="epr-emoji">
      <img src={emojiUrl(emoji)} className="epr-emoji-img" />
    </button>
  );
}
