import * as React from 'react';

import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiHasVariations, emojiNames } from '../../dataUtils/emojiUtils';
import { EmojiRenderProps, ListEmoji } from '../body/listComponents';

import { BaseEmojiProps } from './BaseEmojiProps';
import { ClickableEmojiButton } from './ClickableEmojiButton';
import { ViewOnlyEmoji } from './ViewOnlyEmoji';

type ClickableEmojiProps = Readonly<
  BaseEmojiProps & {
    hidden?: boolean;
    showVariations?: boolean;
    hiddenOnSearch?: boolean;
    emoji: DataEmoji;
    className?: string;
    buttonClassName?: string;
    noBackground?: boolean;
    style?: React.CSSProperties;
    tabIndex?: number;
    as?: React.ComponentType<EmojiRenderProps>;
    emojiInfo?: ListEmoji;
  }
>;

export function ClickableEmoji({
  emoji,
  unified,
  hidden,
  hiddenOnSearch,
  emojiStyle,
  showVariations = true,
  size,
  lazyLoad,
  getEmojiUrl,
  className,
  buttonClassName,
  noBackground = false,
  style,
  tabIndex,
  as,
  emojiInfo,
}: ClickableEmojiProps) {
  const hasVariations = emojiHasVariations(emoji);

  return (
    <ClickableEmojiButton
      tabIndex={tabIndex}
      hasVariations={hasVariations}
      showVariations={showVariations}
      hidden={hidden}
      hiddenOnSearch={hiddenOnSearch}
      emojiNames={emojiNames(emoji)}
      unified={unified}
      noBackground={noBackground}
      style={style}
      className={buttonClassName}
      as={as}
      emojiInfo={emojiInfo}
    >
      <ViewOnlyEmoji
        unified={unified}
        emoji={emoji}
        size={size}
        emojiStyle={emojiStyle}
        lazyLoad={lazyLoad}
        getEmojiUrl={getEmojiUrl}
        className={className}
      />
    </ClickableEmojiButton>
  );
}
