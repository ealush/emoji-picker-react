import { cx } from 'flairup';
import * as React from 'react';

import { stylesheet } from '../../Stylesheet/stylesheet';
import { parseNativeEmoji } from '../../dataUtils/parseNativeEmoji';

import { emojiStyles } from './emojiStyles';

export function NativeEmoji({
  unified,
  style,
  className,
}: {
  unified: string;
  style: React.CSSProperties;
  className?: string;
}) {
  return (
    <span
      className={cx(
        // Order matters: cx() lets the later class win same-property
        // conflicts, so the zeroing reset must come first and the real
        // font-size last — otherwise the emoji renders at 0px.
        emojiStyles.external,
        emojiStyles.common,
        styles.nativeEmoji,
        className,
      )}
      data-unified={unified}
      style={style}
    >
      {parseNativeEmoji(unified)}
    </span>
  );
}

const styles = stylesheet.create({
  nativeEmoji: {
    '.': 'epr-emoji-native',
    fontFamily:
      '"Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji"!important',
    position: 'relative',
    lineHeight: '100%',
    fontSize: 'var(--epr-emoji-size)',
    textAlign: 'center',
    alignSelf: 'center',
    justifySelf: 'center',
    letterSpacing: '0',
    padding: 'var(--epr-emoji-padding)',
  },
});
