import clsx from 'clsx';
import * as React from 'react';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiName,
  emojiUnified,
  emojiUrl
} from '../../dataUtils/emojiSelectors';
import { useIsEmojiFiltered } from '../../hooks/useFilter';
import './Emoji.css';
import { emojiColors } from './emojiColors';

type Props = Readonly<{
  emoji: DataEmoji;
  genVisibilityIndex: (isHidden: boolean) => number;
}>;

export function Emoji({ emoji, genVisibilityIndex }: Props) {
  const hidden = useIsEmojiFiltered(emojiUnified(emoji));
  const index = genVisibilityIndex(hidden);
  const color = bgColor(index);

  return (
    <button
      className={clsx('epr-emoji', { hidden })}
      data-unified={emojiUnified(emoji)}
      style={{ color }}
    >
      <img
        src={emojiUrl(emoji)}
        alt={emojiName(emoji)}
        className="epr-emoji-img"
        loading="lazy"
      />
    </button>
  );
}

function bgColor(order: number): string {
  return emojiColors[order % emojiColors.length];
}
