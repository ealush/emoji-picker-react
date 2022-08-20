import clsx from 'clsx';
import * as React from 'react';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiUnified, emojiUrl } from '../../dataUtils/emojiSelectors';
import { useIsEmojiFiltered } from '../../hooks/useFilter';
import './Emoji.css';

type Props = Readonly<{
  emoji: DataEmoji;
}>;

export function Emoji({ emoji }: Props) {
  const hidden = useIsEmojiFiltered(emojiUnified(emoji));
  return (
    <button
      className={clsx('epr-emoji', { hidden })}
      data-unified={emojiUnified(emoji)}
    >
      <img src={emojiUrl(emoji)} className="epr-emoji-img" />
    </button>
  );
}
