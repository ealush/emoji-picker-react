import clsx from 'clsx';
import * as React from 'react';
import { EmojiStyle } from '../../config/config';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiName, emojiUrlByUnified } from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { useEmojisThatFailedToLoad } from '../context/PickerContext';
import './Emoji.css';

type Props = Readonly<{
  hidden?: boolean;
  emojiStyle: EmojiStyle;
  emoji: DataEmoji;
  unified: string;
}>;

export function Emoji({ emoji, unified, hidden, emojiStyle }: Props) {
  return (
    <button className={clsx('epr-emoji', { hidden })} data-unified={unified}>
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
  const emojisThatFailedToLoad = useEmojisThatFailedToLoad();

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
    emojisThatFailedToLoad.markAsFailedToLoad(unified);
  }
}
