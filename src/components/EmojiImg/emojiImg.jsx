import React from 'react';
import PropTypes from 'prop-types';
import emojiSrc from '../../lib/emojiSrc';
import './style.css';
import { useSetMissingEmoji } from '../../PickerContext';

const EmojiImg = ({ unified, shouldLoad = true, native = false, urlSrc }) => {
  return native ? (
    <div className="native">
      {unified
        .split('-')
        .map(hex => parseInt(hex, 16))
        .map(hex => String.fromCodePoint(hex))
        .join('')}
    </div>
  ) : (
    <Img
      shouldLoad={shouldLoad}
      unified={unified}
      isCustom={true}
      urlSrc={urlSrc}
    />
  );
};

function Img({ unified, shouldLoad, urlSrc }) {
  const setMissingEmoji = useSetMissingEmoji();
  const src = urlSrc ?? emojiSrc(unified);
  return (
    <img
      className="emoji-img"
      onError={() => setMissingEmoji(unified)}
      {...(shouldLoad && src)}
    />
  );
}

export default EmojiImg;

Img.propTypes = {
  unified: PropTypes.string,
  shouldLoad: PropTypes.bool,
  isCustom: PropTypes.bool,
  urlSrc: PropTypes.string,
};

EmojiImg.propTypes = {
  unified: PropTypes.string,
  shouldLoad: PropTypes.bool,
  native: PropTypes.bool,
  urlSrc: PropTypes.string,
};
