import * as React from 'react';

import { EmojiStyle } from '../../types/exposedTypes';

import { ViewOnlyEmoji } from './Emoji';

export function ExportedEmoji({
  unified,
  size = 32,
  emojiStyle = EmojiStyle.APPLE,
  lazyLoad = false
}: {
  unified: string;
  emojiStyle?: EmojiStyle;
  size?: number;
  lazyLoad?: boolean;
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
    />
  );
}
