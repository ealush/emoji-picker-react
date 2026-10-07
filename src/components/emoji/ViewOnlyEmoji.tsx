import * as React from 'react';

import { CustomEmoji } from '../../config/customEmojiConfig';
import { DataEmoji, EmojiProperties } from '../../dataUtils/DataTypes';
import { emojiName, emojiUrlByUnified } from '../../dataUtils/emojiUtils';
import { isCustomEmoji } from '../../typeRefinements/typeRefinements';
import { EmojiStyle } from '../../types/exposedTypes';
import { useEmojisThatFailedToLoadState } from '../context/PickerContext';
import { usePickerDataContext } from '../context/PickerDataContext';

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
  className,
}: BaseEmojiProps) {
  const [, setEmojisThatFailedToLoad] = useEmojisThatFailedToLoadState();
  const { emojiByUnified } = usePickerDataContext();

  const style = {} as React.CSSProperties;
  if (size) {
    style.width =
      style.height =
      style.fontSize =
        typeof size === 'number' ? `${size}px` : size;
  }

  const emojiToRender = emoji ? emoji : emojiByUnified(unified);

  if (!emojiToRender) {
    return null;
  }

  if (isCustomEmoji(emojiToRender)) {
    return (
      <EmojiImg
        style={style}
        // The image's alternative text is the emoji's name, not its id.
        emojiName={customEmojiName(emojiToRender) || unified}
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
    setEmojisThatFailedToLoad(unified);
  }
}

// A custom emoji reaches the renderer either as the consumer's `CustomEmoji`
// (`names`) or as the dataset entry it was converted into (`n`).
function customEmojiName(emoji: CustomEmoji | DataEmoji): string {
  return (
    emojiName(emoji as DataEmoji) ||
    emojiName({ [EmojiProperties.name]: (emoji as CustomEmoji).names })
  );
}
