import * as React from 'react';

import { EmojiStyle } from '../../types/exposedTypes';

import { GetEmojiUrl } from './BaseEmojiProps';
import { ViewOnlyEmoji } from './ViewOnlyEmoji';

export function ExportedEmoji({
  unified,
  size = 32,
  emojiStyle = EmojiStyle.APPLE,
  lazyLoad = false,
  getEmojiUrl,
  emojiUrl
}: {
  unified: string;
  emojiStyle?: EmojiStyle;
  size?: number;
  lazyLoad?: boolean;
  getEmojiUrl?: GetEmojiUrl;
  emojiUrl?: string;
}) {
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
