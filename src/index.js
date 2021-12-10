import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GROUP_NAMES_ENGLISH } from './lib/constants';
import clickHandler from './lib/clickHandler';
import { getRecentlyUsed } from './lib/recentlyUsed';
import { PickerContextProvider, useCloseVariationMenu } from './PickerContext';
import SkinTones, {
  SKIN_TONE_NEUTRAL,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_DARK,
} from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu';
import CategoriesNav from './components/CategoriesNav';
import EmojiList from './components/EmojiList';
import Search from './components/Search';
import RecentlyUsed from './components/RecentlyUsed';
import './style.css';
import { configPropTypes } from './lib/propTypes';

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
  pickerStyle = {},
  groupVisibility = {},
}) => {
  const emojiListRef = useRef(null);
  const isMounted = useRef(true);
  const onClickRef = useRef(onEmojiClick);

  onClickRef.current = onEmojiClick;

  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

  return (
    <PickerContextProvider
      config={{
        activeSkinTone: skinTone,
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
      <Aside pickerStyle={pickerStyle}>
        <CategoriesNav emojiListRef={emojiListRef} />
        <Search />

        <div className="content-wrapper">
          <VariationsMenu />
          <section className="emoji-scroll-wrapper" ref={emojiListRef}>
            <RecentlyUsed emojiListRef={emojiListRef} />
            <EmojiList emojiListRef={emojiListRef} />
          </section>
        </div>
      </Aside>
    </PickerContextProvider>
  );
};

function Aside({ children, pickerStyle }) {
  const closeVariations = useCloseVariationMenu();
  return (
    <aside
      className="emoji-picker-react"
      style={pickerStyle}
      onScroll={closeVariations}
      onMouseDown={closeVariations}
    >
      {children}
    </aside>
  );
}

export {
  SKIN_TONE_NEUTRAL,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_DARK,
};

export default EmojiPicker;

Aside.propTypes = {
  children: PropTypes.node,
  pickerStyle: PropTypes.object,
};

EmojiPicker.propTypes = {
  onEmojiClick: PropTypes.func,
  pickerStyle: PropTypes.objectOf(PropTypes.string),
  ...configPropTypes,
};
