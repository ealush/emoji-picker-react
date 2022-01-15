import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import tinykeys from 'tinykeys';

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from './constants';

import CategoriesNav from './components/CategoriesNav';
import EmojiList from './components/EmojiList';
import RecentlyUsed from './components/RecentlyUsed';
import Search from './components/Search';
import {
  SKIN_TONE_DARK,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_NEUTRAL,
} from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu';
import clickHandler from './lib/clickHandler';
import { GROUP_NAMES_ENGLISH } from './lib/constants';
import { configPropTypes } from './lib/propTypes';
import { getRecentlyUsed } from './lib/recentlyUsed';
import { PickerContextProvider, useCloseVariationMenu } from './PickerContext';

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
  pickerStyle = {},
  groupVisibility = {},
  searchPlaceholder = null,
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

  useEffect(() => {
    let unsubscribe = tinykeys(window, {
      ArrowUp: keyEvent => handleKeyboard(keyEvent.key),
      ArrowDown: keyEvent => handleKeyboard(keyEvent.key),
      ArrowLeft: keyEvent => handleKeyboard(keyEvent.key),
      ArrowRight: keyEvent => handleKeyboard(keyEvent.key),
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleKeyboard = key => {
    const activeElementClass = document.activeElement.getAttribute('class');

    if (activeElementClass && activeElementClass.startsWith('icn-')) {
      handleCategoriesKeyboard(key);
    } else if (activeElementClass === 'emoji-search') {
      handSearchKeyboard(key);
    } else {
      handleEmojiesKeyboard(key);
    }
  };

  const handleCategoriesKeyboard = key => {
    switch (key) {
      case ArrowRight:
        document.activeElement.nextElementSibling.focus();
        break;
      case ArrowLeft:
        document.activeElement.previousElementSibling.focus();
        break;
      case ArrowDown:
        const searchInput = document.getElementsByClassName('emoji-search')[0];
        searchInput.focus();
        break;
    }
  };

  const handSearchKeyboard = key => {
    if (key === ArrowUp) {
      const emojiCategories = document.getElementsByClassName(
        'emoji-categories'
      )[0];
      emojiCategories.firstChild.focus();
    }
    if (key === ArrowDown) {
      const firstEmoji = document.getElementsByClassName('emoji')[0];
      firstEmoji.firstChild.focus();
    }
  };

  const handleEmojiesKeyboard = key => {
    if (key === ArrowRight) {
      document.activeElement.parentElement.nextSibling.firstChild.focus();
    }
    if (key === ArrowLeft) {
      const prevSibling = document.activeElement.parentElement.previousSibling;

      if (prevSibling) {
        prevSibling.firstChild.focus();
      } else {
        const searchInput = document.getElementsByClassName('emoji-search')[0];
        searchInput.focus();
      }
    }
  };

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
      <Aside pickerStyle={pickerStyle}>
        <CategoriesNav emojiListRef={emojiListRef} />
        <Search searchPlaceholder={searchPlaceholder} />

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
