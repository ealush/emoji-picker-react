import * as React from 'react';

import { EmojiStyle } from '../../types/exposedTypes';

import { BaseEmojiProps } from './BaseEmojiProps';
import { ViewOnlyEmoji } from './ViewOnlyEmoji';

export type EmojiComponentType = {
  unified: BaseEmojiProps['unified'];
  emojiStyle?: BaseEmojiProps['emojiStyle'];
  size?: BaseEmojiProps['size'];
  lazyLoad?: BaseEmojiProps['lazyLoad'];
  getEmojiUrl?: BaseEmojiProps['getEmojiUrl'];
  emojiUrl?: string;
}

export function ExportedEmoji({
  unified,
  size = 32,
  emojiStyle = EmojiStyle.APPLE,
  lazyLoad = false,
  getEmojiUrl,
  emojiUrl
}: EmojiComponentType) {
  if (!unified && !emojiUrl && !getEmojiUrl) {
    return null;
  }

  return (
    <ViewOnlyEmoji
      unified={unified}
      size={size}
      emojiStyle={emojiStyle}
      lazyLoad={lazyLoad}
      getEmojiUrl={emojiUrl ? () => emojiUrl : getEmojiUrl}
    />
  );
}
