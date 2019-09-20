import { EMOJI_PROPERTY_UNIFIED } from '../../../lib/constants';
import { setRecentlyUsed } from '../recentlyUsed';
import emojiOutput from '../emojiOutput';

const clickHandler = (onEmojiClick = Function.prototype) => {
    return (e, emoji, unified, activeSkinTone) => {
        setRecentlyUsed(unified);
        return onEmojiClick(e, emojiOutput(emoji, unified, activeSkinTone));
    }
}

export default clickHandler;
