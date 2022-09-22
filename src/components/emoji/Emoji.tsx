import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { EmojiRef } from '../../DomUtils/emojiElementRef';
import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiHasVariations,
  emojiName,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { preloadEmoji } from '../../hooks/preloadEmoji';
import { EmojiStyle } from '../../types/exposedTypes';
import { useEmojisThatFailedToLoadState } from '../context/PickerContext';
import './Emoji.css';

type ClickableEmojiProps = Readonly<
  BaseProps & {
    hidden?: boolean;
    showVariations?: boolean;
    emojiRef?: EmojiRef;
    hiddenOnSearch?: boolean;
  }
>;

type BaseProps = {
  emojiStyle: EmojiStyle;
  emoji: DataEmoji;
  unified: string;
  size?: number;
  lazyLoad?: boolean;
};

export function ClickableEmoji({
  emoji,
  unified,
  hidden,
  hiddenOnSearch,
  emojiStyle,
  showVariations = true,
  size,
  emojiRef,
  lazyLoad
}: ClickableEmojiProps) {
  const hasVariations = emojiHasVariations(emoji);

  const onFocus = hasVariations
    ? () => {
        preloadEmoji(emoji, emojiStyle);
      }
    : undefined;

  return (
    <button
      className={clsx(ClassNames.emoji, {
        [ClassNames.hidden]: hidden,
        [ClassNames.hiddenOnSearch]: hiddenOnSearch,
        [ClassNames.visible]: !hidden,
        [ClassNames.emojiHasVariatios]: hasVariations && showVariations
      })}
      data-unified={unified}
      // @ts-ignore - let's ignore the fact this is not a real react ref, ok?
      ref={emojiRef}
      aria-label={emojiName(emoji)}
      onFocus={onFocus}
    >
      <ViewOnlyEmoji
        unified={unified}
        emoji={emoji}
        size={size}
        emojiStyle={emojiStyle}
        lazyLoad={lazyLoad}
      />
    </button>
  );
}

export function ViewOnlyEmoji({
  emoji,
  unified,
  emojiStyle,
  size,
  lazyLoad
}: BaseProps) {
  const style = {} as React.CSSProperties;
  if (size) {
    style.width = style.height = style.fontSize = `${size}px`;
  }

  return (
    <>
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji unified={unified} style={style} />
      ) : (
        <EmojiImg
          unified={unified}
          style={style}
          emoji={emoji}
          emojiStyle={emojiStyle}
          lazyLoad={lazyLoad}
        />
      )}
    </>
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
  style,
  lazyLoad = false
}: {
  emoji: DataEmoji;
  unified: string;
  emojiStyle: EmojiStyle;
  style: React.CSSProperties;
  lazyLoad?: boolean;
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
