import * as React from 'react';

import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiHasVariations, emojiNames } from '../../dataUtils/emojiSelectors';

import { BaseEmojiProps } from './BaseEmojiProps';
import { ClickableEmojiButton } from './ClickableEmojiButton';
import { ViewOnlyEmoji } from './ViewOnlyEmoji';

type ClickableEmojiProps = Readonly<
  BaseEmojiProps & {
    hidden?: boolean;
    selected?: boolean;
    showVariations?: boolean;
    hiddenOnSearch?: boolean;
    emoji: DataEmoji;
    className?: string;
    noBackground?: boolean;
  }
>;

export function ClickableEmoji({
  emoji,
  unified,
  hidden,
  selected,
  hiddenOnSearch,
  emojiStyle,
  showVariations = true,
  size,
  lazyLoad,
  getEmojiUrl,
  className,
  noBackground = false
}: ClickableEmojiProps) {
  const hasVariations = emojiHasVariations(emoji);

  return (
    <ClickableEmojiButton
      hasVariations={hasVariations}
      showVariations={showVariations}
      hidden={hidden}
      selected={selected}
      hiddenOnSearch={hiddenOnSearch}
      emojiNames={emojiNames(emoji)}
      unified={unified}
      noBackground={noBackground}
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
