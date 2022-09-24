import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { DataEmoji } from '../../dataUtils/DataTypes';
import { asEmoji } from '../../dataUtils/asEmoji';
import {
  emojiByUnified,
  emojiHasVariations,
  emojiName,
  emojiNames,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';
import { EmojiStyle } from '../../types/exposedTypes';
import { useEmojisThatFailedToLoadState } from '../context/PickerContext';
import './Emoji.css';

type ClickableEmojiProps = Readonly<
  BaseProps & {
    hidden?: boolean;
    showVariations?: boolean;
    hiddenOnSearch?: boolean;
    emoji: DataEmoji;
  }
>;

type BaseProps = {
  emoji?: DataEmoji;
  emojiStyle: EmojiStyle;
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
  lazyLoad
}: ClickableEmojiProps) {
  const hasVariations = emojiHasVariations(emoji);

  return (
    <button
      className={clsx(ClassNames.emoji, {
        [ClassNames.hidden]: hidden,
        [ClassNames.hiddenOnSearch]: hiddenOnSearch,
        [ClassNames.visible]: !hidden && !hiddenOnSearch,
        [ClassNames.emojiHasVariatios]: hasVariations && showVariations
      })}
      data-unified={unified}
      // @ts-ignore - let's ignore the fact this is not a real react ref, ok?
      aria-label={emojiName(emoji)}
      data-full-name={emojiNames(emoji)}
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

  const emojiToRender = emoji ? emoji : emojiByUnified(unified);

  return (
    <>
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji unified={unified} style={style} />
      ) : (
        <EmojiImg
          unified={unified}
          style={style}
          emoji={asEmoji(emojiToRender)}
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
    <span
      className={clsx(ClassNames.external, 'epr-emoji-native')}
      data-unified={unified}
      style={style}
    >
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
