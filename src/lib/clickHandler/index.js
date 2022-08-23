import { setRecentlyUsed } from '../recentlyUsed';
import emojiOutput from '../emojiOutput';
import { actionTypes } from '../reducer';

const clickHandler = (onClickRef = {}, dispatch) => (
  e,
  unified,
  emoji,
  activeSkinTone
) => {
  const output = emojiOutput(unified, emoji, activeSkinTone);

  setRecentlyUsed(output);
  //   dispatch({ type: actionTypes.UPDATE_RECENTLY_USED });

  return onClickRef.current && onClickRef.current(e, output);
};

export default clickHandler;
