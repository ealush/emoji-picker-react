import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../Stylesheet/stylesheet';
import { DEFAULT_NATIVE_EMOJI_FONT } from '../../dataUtils/nativeEmojiSupport';
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
      data-epr-unified={unified}
      style={style}
    >
      {parseNativeEmoji(unified)}
    </span>
  );
}

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    nativeEmoji: {
      '.': 'epr-emoji-native',
      // Overridable (e.g. with a country-flag polyfill font); native support
      // detection probes the same variable.
      fontFamily: `var(--epr-emoji-font-family, ${DEFAULT_NATIVE_EMOJI_FONT})!important`,
      position: 'relative',
      lineHeight: '100%',
      fontSize: 'var(--epr-emoji-size)',
      textAlign: 'center',
      alignSelf: 'center',
      justifySelf: 'center',
      letterSpacing: '0',
      padding: 'var(--epr-emoji-padding)',
    },
  }))();
