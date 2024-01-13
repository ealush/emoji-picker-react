import * as React from 'react';

import {
  emojiByUnified,
  emojiName,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { isCustomEmoji } from '../../typeRefinements/typeRefinements';
import { EmojiStyle } from '../../types/exposedTypes';
import { useEmojisThatFailedToLoadState } from '../context/PickerContext';

import { BaseEmojiProps } from './BaseEmojiProps';
import { EmojiImg } from './EmojiImg';
import { NativeEmoji } from './NativeEmoji';

export function ViewOnlyEmoji({
  emoji,
  unified,
  emojiStyle,
  size,
  lazyLoad,
  getEmojiUrl = emojiUrlByUnified,
  className
}: BaseEmojiProps) {
  const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();

  const style = {} as React.CSSProperties;
  if (size) {
    style.width = style.height = style.fontSize = `${size}px`;
  }

  const emojiToRender = emoji ? emoji : emojiByUnified(unified);

  if (!emojiToRender) {
    return null;
  }

  if (isCustomEmoji(emojiToRender)) {
    return (
      <EmojiImg
        style={style}
        emojiName={unified}
        emojiStyle={EmojiStyle.NATIVE}
        lazyLoad={lazyLoad}
        imgUrl={emojiToRender.imgUrl}
        onError={onError}
        className={className}
      />
    );
  }

  return (
    <>
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji unified={unified} style={style} className={className} />
      ) : (
        <EmojiImg
          style={style}
          emojiName={emojiName(emojiToRender)}
          emojiStyle={emojiStyle}
          lazyLoad={lazyLoad}
          imgUrl={getEmojiUrl(unified, emojiStyle)}
          onError={onError}
          className={className}
        />
      )}
    </>
  );

  function onError() {
    setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
  }
}
