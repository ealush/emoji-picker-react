import clsx from 'clsx';
import * as React from 'react';
import { EmojiStyle } from '../../config/config';
import { SkinTones } from '../../data/skinToneVariations';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  activeVariationFromUnified,
  emojiHasVariations,
  emojiName,
  emojiNames,
  emojiUnified,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { setRecentlyUsed } from '../../dataUtils/recentlyUsed';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { EmojiClickData } from '../../hooks/useMouseDownHandlers';
import { useOnEmojiClickConfig } from '../context/PickerConfigContext';

import {
  useActiveSkinToneState,
  useDisallowClickRef,
  useEmojisThatFailedToLoadState
} from '../context/PickerContext';
import './Emoji.css';

type Props = Readonly<{
  hidden?: boolean;
  emojiStyle: EmojiStyle;
  emoji: DataEmoji;
  unified: string;
  showVariations?: boolean;
  size?: number;
}>;

function useHandleClick(emoji: DataEmoji) {
  const disallowClickRef = useDisallowClickRef();
  const [activeSkinTone] = useActiveSkinToneState();
  const onEmojiClick = useOnEmojiClickConfig();
  const { closeAllOpenToggles } = useCloseAllOpenToggles();

  return function onClick(event: React.MouseEvent) {
    if (disallowClickRef.current) {
      return;
    }

    closeAllOpenToggles();

    const unified = emojiUnified(emoji);

    const skinToneToUse = activeVariationFromUnified(unified) || activeSkinTone;

    setRecentlyUsed(emoji, skinToneToUse);
    onEmojiClick(event, emojiClickOutput(emoji, skinToneToUse));
  };
}

export function Emoji({
  emoji,
  unified,
  hidden,
  emojiStyle,
  showVariations = true,
  size
}: Props) {
  const hasVariations = emojiHasVariations(emoji);
  const onClick = useHandleClick(emoji);

  let style = {} as React.CSSProperties;
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
      onClick={onClick}
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

function emojiClickOutput(
  emoji: DataEmoji,
  activeSkinTone: SkinTones
): EmojiClickData {
  const unified = emojiUnified(emoji, activeSkinTone);
  return {
    activeSkinTone,
    unified: unified,
    unifiedWithoutSkinTone: emojiUnified(emoji),
    emoji: parseNativeEmoji(unified),
    names: emojiNames(emoji),
    getImageUrl(emojiStyle: EmojiStyle) {
      return emojiUrlByUnified(emojiStyle, unified);
    }
  };
}
