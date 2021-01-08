import { setRecentlyUsed } from '../recentlyUsed';
import emojiOutput from '../emojiOutput';

const clickHandler = (onClickRef = {}) => (
  e,
  unified,
  emoji,
  activeSkinTone
) => {
  const output = emojiOutput(unified, emoji, activeSkinTone);
  setRecentlyUsed(output);
  return onClickRef.current && onClickRef.current(e, output);
};

export default clickHandler;
