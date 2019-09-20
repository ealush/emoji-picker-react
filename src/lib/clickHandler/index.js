import { setRecentlyUsed } from '../recentlyUsed';
import emojiOutput from '../emojiOutput';

const clickHandler = (onEmojiClick = Function.prototype) => (e, unified, emoji, activeSkinTone) => {
    setRecentlyUsed(unified);
    return onEmojiClick(e, emojiOutput(unified, emoji, activeSkinTone));
};

export default clickHandler;
