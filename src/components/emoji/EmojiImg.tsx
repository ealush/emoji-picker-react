import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiName } from '../../dataUtils/emojiSelectors';
import { EmojiStyle } from '../../types/exposedTypes';
import { useEmojisThatFailedToLoadState } from '../context/PickerContext';

export function EmojiImg({
  emoji,
  unified,
  style,
  lazyLoad = false,
  imgUrl
}: {
  emoji: DataEmoji;
  unified: string;
  emojiStyle: EmojiStyle;
  style: React.CSSProperties;
  lazyLoad?: boolean;
  imgUrl: string;
}) {
  const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();

  return (
    <img
      src={imgUrl}
      alt={emojiName(emoji)}
      className={clsx(ClassNames.external, 'epr-emoji-img')}
      loading={lazyLoad ? 'lazy' : 'eager'}
      onError={onError}
      style={style}
    />
  );

  function onError() {
    setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
  }
}
