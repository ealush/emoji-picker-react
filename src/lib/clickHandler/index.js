import { setRecentlyUsed } from '../recentlyUsed';
import emojiOutput from '../emojiOutput';

const clickHandler = (onEmojiClick = Function.prototype) => (e, unified, emoji, activeSkinTone) => {
    const output = emojiOutput(unified, emoji, activeSkinTone);
    setRecentlyUsed(output);
    return onEmojiClick(e, output);
};

export default clickHandler;
