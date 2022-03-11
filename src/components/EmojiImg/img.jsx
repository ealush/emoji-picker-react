import React from 'react';
import PropTypes from 'prop-types';
import emojiSrc from '../../lib/emojiSrc';
import { useSetMissingEmoji } from '../../PickerContext';

function Img({ unified, shouldLoad, urlSrc }) {
  const setMissingEmoji = useSetMissingEmoji();
  const src = urlSrc ?? emojiSrc(unified);
  //todo:erez should make wiser condition below

  return urlSrc ? (
    <img
      className="emoji-img"
      onError={() => setMissingEmoji(unified)}
      src={urlSrc}
    />
  ) : (
    <img
      className="emoji-img"
      onError={() => setMissingEmoji(unified)}
      {...(shouldLoad && src)}
    />
  );
}

export default Img;

Img.propTypes = {
  unified: PropTypes.string,
  shouldLoad: PropTypes.bool,
  isCustom: PropTypes.bool,
  urlSrc: PropTypes.string,
};
