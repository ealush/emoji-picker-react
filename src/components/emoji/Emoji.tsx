import clsx from 'clsx';
import * as React from 'react';

import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiHasVariations,
  emojiName,
  emojiUnified,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
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
}>;

export function Emoji({
  emoji,
  unified,
  hidden,
  emojiStyle,
  showVariations = true,
  size,
  emojiRef
}: Props) {
  const hasVariations = emojiHasVariations(emoji);

  const style = {} as React.CSSProperties;
  if (size) {
    style.width = style.height = style.fontSize = `${size}px`;
  }

  const base = {
    style,
    unified
  };

  return (
    <button
      className={clsx('epr-emoji', {
        hidden,
        'epr-emoji-has-variations': hasVariations && showVariations
      })}
      data-unified={unified}
      data-original={emojiUnified(emoji)}
      // @ts-ignore - let's ignore the fact this is not a real react ref, ok?
      ref={emojiRef}
    >
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji {...base} />
      ) : (
        <EmojiImg {...base} emoji={emoji} emojiStyle={emojiStyle} />
      )}
    </button>
  );
}

function NativeEmoji({
  unified,
  style
}: {
  unified: string;
  style: React.CSSProperties;
}) {
  return (
    <span className="epr-emoji-native" data-unified={unified} style={style}>
      {parseNativeEmoji(unified)}
    </span>
  );
}

function EmojiImg({
  emoji,
  unified,
  emojiStyle,
  style
}: {
  emoji: DataEmoji;
  unified: string;
  emojiStyle: EmojiStyle;
  style: React.CSSProperties;
}) {
  const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();

  return (
    <img
      src={emojiUrlByUnified(emojiStyle, unified)}
      alt={emojiName(emoji)}
      className="epr-emoji-img"
      loading="lazy"
      onError={onError}
      style={style}
    />
  );

  function onError() {
    setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
  }
}
