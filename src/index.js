import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

import EmojiPickerContent from './components/EmojiPickerContent';

import {
  SKIN_TONE_DARK,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_NEUTRAL,
} from './components/SkinTones';

import clickHandler from './lib/clickHandler';
import { GROUP_NAMES_ENGLISH } from './lib/constants';
import { configPropTypes } from './lib/propTypes';
import { getRecentlyUsed } from './lib/recentlyUsed';
import { PickerContextProvider } from './PickerContext';

import './style.css';

const EmojiPicker = ({
  emojiUrl = DEFAULT_EMOJI_URL,
  onEmojiClick,
  preload = false,
  native = false,
  skinTone = SKIN_TONE_NEUTRAL,
  disableAutoFocus = false,
  disableSearchBar = false,
  disableSkinTonePicker = false,
  groupNames = {},
  groupVisibility = {},
  ...otherProps
}) => {

  const isMounted = useRef(true);
  const onClickRef = useRef(onEmojiClick);

  onClickRef.current = onEmojiClick;

  useEffect(() => () => (isMounted.current = false), []);

  return (
    <PickerContextProvider
      config={{
        skinTone,
        emojiUrl,
        preload,
        native,
        groupNames: Object.assign(GROUP_NAMES_ENGLISH, groupNames),
        groupVisibility,
        disableSearchBar,
        disableAutoFocus,
        disableSkinTonePicker,
      }}
      recentlyUsed={getRecentlyUsed()}
      onEmojiClick={clickHandler(onClickRef)}
    >
      <EmojiPickerContent {...otherProps} />
    </PickerContextProvider>
  );
};

export {
  SKIN_TONE_NEUTRAL,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_DARK,
};

export default EmojiPicker;

EmojiPicker.propTypes = {
  onEmojiClick: PropTypes.func,
  pickerStyle: PropTypes.objectOf(PropTypes.string),
  ...configPropTypes,
};
