import {
  EMOJI_PROPERTY_UNIFIED,
  EMOJI_PROPERTY_NAME,
} from '../../../lib/constants';

const emojiOutput = (unified, urlSrc, emoji, activeSkinTone, extra = {}) =>
  Object.assign(
    {
      unified,
      emoji: unified
        ? unified
            .split('-')
            .map(hex => parseInt(hex, 16))
            .map(hex => String.fromCodePoint(hex))
            .join('')
        : urlSrc,
      originalUnified: emoji[EMOJI_PROPERTY_UNIFIED],
      names: emoji[EMOJI_PROPERTY_NAME],
      activeSkinTone,
    },
    extra
  );

export default emojiOutput;
