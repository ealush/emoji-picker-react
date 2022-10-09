import * as React from 'react';

import { EmojiStyle } from '../../types/exposedTypes';

import { GetEmojiUrl, ViewOnlyEmoji } from './Emoji';

export function ExportedEmoji({
  unified,
  size = 32,
  emojiStyle = EmojiStyle.APPLE,
  lazyLoad = false,
  getEmojiUrl,
}: {
  unified: string;
  emojiStyle?: EmojiStyle;
  size?: number;
  lazyLoad?: boolean;
  getEmojiUrl?: GetEmojiUrl;
}) {
  if (!unified) {
    return null;
  }

  return (
    <ViewOnlyEmoji
      unified={unified}
      size={size}
      emojiStyle={emojiStyle}
      lazyLoad={lazyLoad}
      getEmojiUrl={getEmojiUrl}
    />
  );
}
