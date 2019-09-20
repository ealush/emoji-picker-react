import { setRecentlyUsed } from '../recentlyUsed';
import emojiOutput from '../emojiOutput';

const clickHandler = (onEmojiClick = Function.prototype) => (e, emoji, unified, activeSkinTone) => {
    setRecentlyUsed(unified);
    return onEmojiClick(e, emojiOutput(emoji, unified, activeSkinTone));
};

export default clickHandler;
