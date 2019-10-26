import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_NAME } from '../../../lib/constants';

const emojiOutput = (unified, emoji, activeSkinTone, extra = {}) => Object.assign({
    unified,
    emoji: String.fromCodePoint(parseInt(unified, 16)),
    originalUnified: emoji[EMOJI_PROPERTY_UNIFIED],
    names: emoji[EMOJI_PROPERTY_NAME],
    activeSkinTone
}, extra);

export default emojiOutput;
