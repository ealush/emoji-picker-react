import clsx from 'clsx';
import * as React from 'react';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiName, emojiUrlByUnified } from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { useCdnUrlConfig } from '../context/PickerConfigContext';
import { useEmojisThatFailedToLoad } from '../context/PickerContext';
import './Emoji.css';

type Props = Readonly<{
  hidden?: boolean;
  native: boolean;
  emoji: DataEmoji;
  unified: string;
}>;

export function Emoji({ emoji, unified, hidden, native }: Props) {
  return (
    <button className={clsx('epr-emoji', { hidden })} data-unified={unified}>
      {native ? (
        <NativeEmoji unified={unified} />
      ) : (
        <EmojiImg emoji={emoji} unified={unified} />
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

function EmojiImg({ emoji, unified }: { emoji: DataEmoji; unified: string }) {
  const emojisThatFailedToLoad = useEmojisThatFailedToLoad();
  const cdnUrl = useCdnUrlConfig();

  return (
    <img
      src={emojiUrlByUnified(cdnUrl, unified)}
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
