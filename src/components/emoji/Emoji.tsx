import * as React from 'react';

import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiByUnified,
  emojiHasVariations,
  emojiNames,
  emojiUrlByUnified
} from '../../dataUtils/emojiSelectors';
import { EmojiStyle } from '../../types/exposedTypes';

import './Emoji.css';
import { ClickableEmojiButton } from './ClickableEmojiButton';
import { EmojiImg } from './EmojiImg';
import { NativeEmoji } from './NativeEmoji';

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
  getEmojiUrl?: GetEmojiUrl;
};

export function ClickableEmoji({
  emoji,
  unified,
  hidden,
  hiddenOnSearch,
  emojiStyle,
  showVariations = true,
  size,
  lazyLoad,
  getEmojiUrl
}: ClickableEmojiProps) {
  const hasVariations = emojiHasVariations(emoji);

  return (
    <ClickableEmojiButton
      hasVariations={hasVariations}
      showVariations={showVariations}
      hidden={hidden}
      hiddenOnSearch={hiddenOnSearch}
      emojiNames={emojiNames(emoji)}
      unified={unified}
    >
      <ViewOnlyEmoji
        unified={unified}
        emoji={emoji}
        size={size}
        emojiStyle={emojiStyle}
        lazyLoad={lazyLoad}
        getEmojiUrl={getEmojiUrl}
      />
    </ClickableEmojiButton>
  );
}

export function ViewOnlyEmoji({
  emoji,
  unified,
  emojiStyle,
  size,
  lazyLoad,
  getEmojiUrl = emojiUrlByUnified
}: BaseProps) {
  const style = {} as React.CSSProperties;
  if (size) {
    style.width = style.height = style.fontSize = `${size}px`;
  }

  const emojiToRender = emoji ? emoji : emojiByUnified(unified);
  if (!emojiToRender) {
    return null;
  }

  return (
    <>
      {emojiStyle === EmojiStyle.NATIVE ? (
        <NativeEmoji unified={unified} style={style} />
      ) : (
        <EmojiImg
          unified={unified}
          style={style}
          emoji={emojiToRender}
          emojiStyle={emojiStyle}
          lazyLoad={lazyLoad}
          imgUrl={getEmojiUrl(unified, emojiStyle)}
        />
      )}
    </>
  );
}

export type GetEmojiUrl = (unified: string, style: EmojiStyle) => string;
