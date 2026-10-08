import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../Stylesheet/stylesheet';
import { EmojiStyleValue } from '../../types/exposedTypes';

import { emojiStyles } from './emojiStyles';

export function EmojiImg({
  emojiName,
  style,
  lazyLoad = false,
  imgUrl,
  onError,
  className,
}: {
  emojiName: string;
  emojiStyle: EmojiStyleValue;
  style: React.CSSProperties;
  lazyLoad?: boolean;
  imgUrl: string;
  onError: () => void;
  className?: string;
}) {
  return (
    <img
      src={imgUrl}
      alt={emojiName}
      className={cx(
        styles.emojiImag,
        emojiStyles.external,
        emojiStyles.common,
        className,
      )}
      loading={lazyLoad ? 'lazy' : 'eager'}
      onError={onError}
      style={style}
    />
  );
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    emojiImag: {
      '.': 'epr-emoji-img',
      maxWidth: 'var(--epr-emoji-fullsize)',
      maxHeight: 'var(--epr-emoji-fullsize)',
      minWidth: 'var(--epr-emoji-fullsize)',
      minHeight: 'var(--epr-emoji-fullsize)',
      padding: 'var(--epr-emoji-padding)',
    },
  }))();
