import * as React from 'react';

import { CustomEmoji } from '../../config/customEmojiConfig';
import { DataEmoji, EmojiProperties } from '../../dataUtils/DataTypes';
import {
  addedIn,
  emojiName,
  emojiUrlByUnified,
} from '../../dataUtils/emojiUtils';
import { isNativeEmojiSupported } from '../../dataUtils/nativeEmojiSupport';
import { isCustomEmoji } from '../../typeRefinements/typeRefinements';
import { EmojiStyle } from '../../types/exposedTypes';
import {
  useEmojisThatFailedToLoadState,
  useNativeEmojiSupport,
} from '../context/PickerContext';
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
  const nativeSupport = useNativeEmojiSupport();

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

  let imageUrl: string;
  let imageName: string;
  let imageStyle = emojiStyle;
  if (isCustomEmoji(emojiToRender)) {
    imageUrl = emojiToRender.imgUrl;
    // Alternative text is the custom emoji's name, not its id.
    imageName = customEmojiName(emojiToRender) || unified;
    imageStyle = EmojiStyle.NATIVE;
  } else if (emojiStyle === EmojiStyle.NATIVE) {
    // Also covers managed preview/default glyphs outside the grid.
    return isNativeEmojiSupported(
      nativeSupport,
      unified,
      addedIn(emojiToRender),
    ) ? (
      <NativeEmoji unified={unified} style={style} className={className} />
    ) : null;
  } else {
    imageUrl = getEmojiUrl(unified, emojiStyle);
    imageName = emojiName(emojiToRender);
  }

  return (
    <EmojiImg
      style={style}
      emojiName={imageName}
      emojiStyle={imageStyle}
      lazyLoad={lazyLoad}
      imgUrl={imageUrl}
      onError={onError}
      className={className}
    />
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
