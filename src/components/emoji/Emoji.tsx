import * as React from 'react';

import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojiHasVariations, emojiNames } from '../../dataUtils/emojiSelectors';

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
    round?: boolean;
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
  round = false
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
      round={round}
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
