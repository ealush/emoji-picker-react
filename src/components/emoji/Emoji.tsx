import * as React from 'react';

import { DataEmoji } from '../../dataUtils/DataTypes';
import {
  emojiHasVariations,
  emojiNames,
  emojiUrlByUnified,
} from '../../dataUtils/emojiUtils';
import { usePickerComponents } from '../../primitives/components';
import { emojiRenderInfo, useListComponents } from '../body/listComponents';

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
    role?: 'gridcell';
    index?: number;
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
  getEmojiUrl = emojiUrlByUnified,
  className,
  buttonClassName,
  noBackground = false,
  style,
  tabIndex,
  role,
  index,
}: ClickableEmojiProps) {
  const hasVariations = emojiHasVariations(emoji);
  const { Emoji: SharedEmoji } = usePickerComponents();
  const Custom = useListComponents().Emoji ?? SharedEmoji;
  const info = Custom
    ? emojiRenderInfo(emoji, unified, emojiStyle, getEmojiUrl)
    : undefined;

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
      as={Custom}
      emojiInfo={info}
      role={role}
      index={index}
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
