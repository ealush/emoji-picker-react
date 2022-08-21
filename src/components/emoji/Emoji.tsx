import clsx from 'clsx';
import * as React from 'react';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiUnified, emojiUrl } from '../../dataUtils/emojiSelectors';
import { useIsEmojiFiltered } from '../../hooks/useFilter';
import './Emoji.css';
import { emojiColors } from './emojiColors';

type Props = Readonly<{
  emoji: DataEmoji;
  hidden: boolean;
  index: number;
}>;

export function Emoji({ emoji, hidden, index }: Props) {
  const color = bgColor(index);

  return (
    <button
      className={clsx('epr-emoji', { hidden })}
      data-unified={emojiUnified(emoji)}
      style={{ color }}
    >
      <img src={emojiUrl(emoji)} className="epr-emoji-img" />
    </button>
  );
}

function bgColor(order: number): string {
  return emojiColors[order % emojiColors.length];
}
