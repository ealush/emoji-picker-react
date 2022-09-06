import clsx from 'clsx';
import * as React from 'react';

import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiHasVariations,
  emojiName,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { ClassNames } from '../../DomUtils/classNames';
import { EmojiRef } from '../../DomUtils/emojiElementRef';
import { EmojiStyle } from '../../types/exposedTypes';
import { useEmojisThatFailedToLoadState } from '../context/PickerContext';
import './Emoji.css';

type Props = Readonly<{
  hidden?: boolean;
  emojiStyle: EmojiStyle;
  emoji: DataEmoji;
  unified: string;
  showVariations?: boolean;
  size?: number;
  emojiRef?: EmojiRef;
  lazyLoad?: boolean;
}>;

export function Emoji({
  emoji,
  unified,
  hidden,
  emojiStyle,
  showVariations = true,
  size,
  emojiRef,
  lazyLoad
}: Props) {
  const hasVariations = emojiHasVariations(emoji);

  const style = {} as React.CSSProperties;
  if (size) {
    style.width = style.height = style.fontSize = `${size}px`;
  }

  return (
    <button
      className={clsx('epr-emoji', {
        [ClassNames.hidden]: hidden,
        [ClassNames.visible]: !hidden,
        'epr-emoji-has-variations': hasVariations && showVariations
      })}
      data-unified={unified}
      style={style}
      // @ts-ignore - let's ignore the fact this is not a real react ref, ok?
      ref={emojiRef}
    >
      {emojiStyle === EmojiStyle.NATIVE ? (
        parseNativeEmoji(unified)
      ) : (
        <EmojiImg
          unified={unified}
          emoji={emoji}
          emojiStyle={emojiStyle}
          lazyLoad={lazyLoad}
          style={style}
        />
      )}
    </button>
  );
}

function EmojiImg({
  emoji,
  unified,
  emojiStyle,
  lazyLoad = false,
  style
}: {
  emoji: DataEmoji;
  unified: string;
  emojiStyle: EmojiStyle;
  lazyLoad?: boolean;
  style: React.CSSProperties;
}) {
  const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();

  return (
    <img
      src={emojiUrlByUnified(emojiStyle, unified)}
      alt={emojiName(emoji)}
      className="epr-emoji-img"
      loading={lazyLoad ? 'lazy' : 'eager'}
      onError={onError}
      style={style}
    />
  );

  function onError() {
    setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
  }
}
