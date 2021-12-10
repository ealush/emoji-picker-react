import React from 'react';
import PropTypes from 'prop-types';
import emojiSrc from '../../lib/emojiSrc';
import './style.css';
import { useSetMissingEmoji } from '../../PickerContext';

const EmojiImg = ({ unified, shouldLoad = true, native = false }) => {
  return native ? (
    <div className="native">
      {unified
        .split('-')
        .map(hex => parseInt(hex, 16))
        .map(hex => String.fromCodePoint(hex))
        .join('')}
    </div>
  ) : (
    <Img shouldLoad={shouldLoad} unified={unified} />
  );
};

function Img({ unified, shouldLoad }) {
  const setMissingEmoji = useSetMissingEmoji();
  const src = emojiSrc(unified);
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
};

EmojiImg.propTypes = {
  unified: PropTypes.string,
  shouldLoad: PropTypes.bool,
  native: PropTypes.bool,
};
