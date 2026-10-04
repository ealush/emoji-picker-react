import * as React from 'react';

import { resolveEmojiStyle } from '../../config/config';
import { EmojiStyleValue } from '../../types/exposedTypes';

import { GetEmojiUrl } from './BaseEmojiProps';
import { ViewOnlyEmoji } from './ViewOnlyEmoji';

export function ExportedEmoji({
  unified,
  size = 32,
  emojiStyle,
  lazyLoad = false,
  getEmojiUrl,
  emojiUrl,
}: {
  unified: string;
  emojiStyle?: EmojiStyleValue;
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
      emojiStyle={resolveEmojiStyle(emojiStyle, emojiUrl || getEmojiUrl)}
      lazyLoad={lazyLoad}
      getEmojiUrl={emojiUrl ? () => emojiUrl : getEmojiUrl}
    />
  );
}
