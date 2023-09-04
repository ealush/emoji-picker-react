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
  getEmojiUrl = emojiUrlByUnified
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

  const name = emojiName(emojiToRender);

  if (isCustomEmoji(emojiToRender)) {
    return (
      <EmojiImg
        style={style}
        emojiName={name}
        emojiStyle={emojiStyle}
        lazyLoad={lazyLoad}
        imgUrl={emojiToRender.imgUrl}
        onError={() => {
          setEmojisThatFailedToLoad(prev => new Set(prev).add(name));
        }}
      />
    );
  }

  return (
    <>
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji unified={unified} style={style} />
      ) : (
        <EmojiImg
          style={style}
          emojiName={name}
          emojiStyle={emojiStyle}
          lazyLoad={lazyLoad}
          imgUrl={getEmojiUrl(unified, emojiStyle)}
          onError={() => {
            setEmojisThatFailedToLoad(prev => new Set(prev).add(unified));
          }}
        />
      )}
    </>
  );
}
