import clsx from 'clsx';
import * as React from 'react';
import { EmojiStyle } from '../../config/config';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiHasVariations,
  emojiName,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { useEmojiMouseEvents } from '../../hooks/useEmojiMouseEvents';

import { useEmojisThatFailedToLoadState } from '../context/PickerContext';
import './Emoji.css';

type Props = Readonly<{
  hidden?: boolean;
  emojiStyle: EmojiStyle;
  emoji: DataEmoji;
  unified: string;
  disableTip?: boolean;
}>;

export function Emoji({
  emoji,
  unified,
  hidden,
  emojiStyle,
  disableTip
}: Props) {
  const hasVariations = emojiHasVariations(emoji);
  const { handleMouseDown, handleMouseUp, handleClick } = useEmojiMouseEvents(
    emoji
  );
  return (
    <button
      className={clsx('epr-emoji', {
        hidden,
        ['epr-emoji-has-variations']: hasVariations && !disableTip
      })}
      data-unified={unified}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
      onClick={handleClick(unified)}
    >
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji unified={unified} />
      ) : (
        <EmojiImg emoji={emoji} unified={unified} emojiStyle={emojiStyle} />
      )}
    </button>
  );
}

function NativeEmoji({ unified }: { unified: string }) {
  return (
    <span className="epr-emoji-native" data-unified={unified}>
      {parseNativeEmoji(unified)}
    </span>
  );
}

function EmojiImg({
  emoji,
  unified,
  emojiStyle
}: {
  emoji: DataEmoji;
  unified: string;
  emojiStyle: EmojiStyle;
}) {
  const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();

  return (
    <img
      src={emojiUrlByUnified(emojiStyle, unified)}
      alt={emojiName(emoji)}
      className="epr-emoji-img"
      loading="lazy"
      onError={onError}
    />
  );

  function onError() {
    setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
  }
}
