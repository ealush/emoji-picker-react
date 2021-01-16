import React, { useReducer, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GROUP_NAME_PEOPLE } from '../lib/constants';
import { PROPERTY_DATA_NAME, GROUP_NAMES_ENGLISH } from './lib/constants';
import reducer, { PickerContext, actionTypes } from './lib/reducer';
import clickHandler from './lib/clickHandler';
import { getRecentlyUsed } from './lib/recentlyUsed';
import SkinTones, {
  SKIN_TONE_NEUTRAL,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_DARK,
  DATA_NAME,
} from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu';
import CategoriesNav from './components/CategoriesNav';
import EmojiList from './components/EmojiList';
import Search from './components/Search';
import RecentlyUsed from './components/RecentlyUsed';
import './style.css';
import { groupNamesPropType } from './lib/propTypes';

const EmpojiPicker = ({
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

  const [state, useReducerDispatch] = useReducer(reducer, {
    activeSkinTone: skinTone,
    emojiUrl,
    seenGroups: { [GROUP_NAME_PEOPLE]: true },
    recentlyUsed: getRecentlyUsed(),
    preload,
    native,
    filterResult: null,
    groupNames: Object.assign(GROUP_NAMES_ENGLISH, groupNames),
    groupVisibility,
  });

  const dispatch = (...props) => {
    if (!isMounted.current) {
      return;
    }
    return useReducerDispatch(...props);
  };

  const closeVariations = ({ target }) => {
    if (state.variationMenu) {
      dispatch({ type: actionTypes.VARIATION_MENU_SET });
    }

    if (
      state.skinTonesSpread &&
      target.getAttribute(PROPERTY_DATA_NAME) !== DATA_NAME
    ) {
      dispatch({ type: actionTypes.SKIN_TONES_SPREAD });
    }
  };

  return (
    <PickerContext.Provider
      value={{ state, dispatch, onEmojiClick: clickHandler(onClickRef) }}
    >
      <aside
        className="emoji-picker-react"
        style={pickerStyle}
        onScroll={closeVariations}
        onMouseDown={closeVariations}
      >
        <CategoriesNav emojiListRef={emojiListRef} />
        {!disableSearchBar && (
          <div style={{ position: 'relative' }}>
            <Search disableAutoFocus={disableAutoFocus} />
            {!disableSkinTonePicker && <SkinTones />}
          </div>
        )}

        <div className="content-wrapper" data-name={state.emojiName}>
          <VariationsMenu closeVariations={closeVariations} />
          <section className="emoji-scroll-wrapper" ref={emojiListRef}>
            <RecentlyUsed emojiListRef={emojiListRef} />
            <EmojiList emojiListRef={emojiListRef} />
          </section>
        </div>
      </aside>
    </PickerContext.Provider>
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

export default EmpojiPicker;

EmpojiPicker.propTypes = {
  emojiUrl: PropTypes.string,
  onEmojiClick: PropTypes.func,
  preload: PropTypes.bool,
  skinTone: PropTypes.string,
  disableAutoFocus: PropTypes.bool,
  disableSearchBar: PropTypes.bool,
  disableSkinTonePicker: PropTypes.bool,
  groupNames: groupNamesPropType,
  native: PropTypes.bool,
  pickerStyle: PropTypes.objectOf(PropTypes.string),
  groupVisibility: PropTypes.objectOf(PropTypes.bool),
};
