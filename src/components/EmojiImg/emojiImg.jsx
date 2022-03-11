import React from 'react';
import PropTypes from 'prop-types';
import './style.css';
import Img from './img.jsx';

const EmojiImg = ({ unified, shouldLoad = true, native = false, urlSrc }) => {
  return native && unified ? (
    <div className="native">
      {unified
        .split('-')
        .map(hex => parseInt(hex, 16))
        .map(hex => String.fromCodePoint(hex))
        .join('')}
    </div>
  ) : (
    <Img shouldLoad={shouldLoad} unified={unified} urlSrc={urlSrc} />
  );
};

export default EmojiImg;

EmojiImg.propTypes = {
  unified: PropTypes.string,
  shouldLoad: PropTypes.bool,
  native: PropTypes.bool,
  urlSrc: PropTypes.string,
};
