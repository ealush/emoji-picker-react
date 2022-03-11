import { setRecentlyUsed } from '../recentlyUsed';
import emojiOutput from '../emojiOutput';

const clickHandler = (onClickRef = {}) => (
  e,
  unified,
  urlSrc,
  emoji,
  activeSkinTone
) => {
  const output = emojiOutput(unified, urlSrc, emoji, activeSkinTone);
  setRecentlyUsed(output);
  return onClickRef.current && onClickRef.current(e, output);
};

export default clickHandler;
