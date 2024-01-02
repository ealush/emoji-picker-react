import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { EmojiStyle } from '../../types/exposedTypes';

export function EmojiImg({
  emojiName,
  style,
  lazyLoad = false,
  imgUrl,
  onError
}: {
  emojiName: string;
  emojiStyle: EmojiStyle;
  style: React.CSSProperties;
  lazyLoad?: boolean;
  imgUrl: string;
  onError: () => void;
}) {
  return (
    <img
      src={imgUrl}
      alt={emojiName}
      className={cx(ClassNames.external, 'epr-emoji-img')}
      loading={lazyLoad ? 'lazy' : 'eager'}
      onError={onError}
      style={style}
    />
  );
}
