import PropTypes from 'prop-types';
import React, { useRef } from 'react';

import CategoriesNav from './components/CategoriesNav';
import EmojiList from './components/EmojiList';
import RecentlyUsed from './components/RecentlyUsed';
import Search from './components/Search';
import VariationsMenu from './components/VariationsMenu';
import useKeyboardNavigation from './hooks/useKeyboardNavigation';
import clickHandler from './lib/clickHandler';
import { GROUP_NAMES_ENGLISH } from './lib/constants';
import { configPropTypes, customEmojiPropTypes } from './lib/propTypes';
import {
  PickerContextProvider,
  useCloseVariationMenu,
  useCollapseSkinTones,
} from './PickerContext';

import {
  SKIN_TONE_DARK,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_NEUTRAL,
} from './components/SkinTones';

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
  ...props
}) => {
  const onClickRef = useRef(onEmojiClick);

  onClickRef.current = onEmojiClick;

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
      onEmojiClick={clickHandler(onClickRef)}
    >
      <EmojiPickerContent {...props} />
    </PickerContextProvider>
  );
};

const EmojiPickerContent = ({ pickerStyle = {}, searchPlaceholder = null }) => {
  const emojiPickerRef = useRef(null);
  const emojiListRef = useRef(null);
  const emojiSearchRef = useRef(null);
  const skinToneSpreadRef = useRef(null);
  const categoriesNavRef = useRef(null);

  useKeyboardNavigation({
    categoriesNavRef,
    emojiSearchRef,
    emojiListRef,
    skinToneSpreadRef,
  });

  return (
    <Aside
      pickerStyle={pickerStyle}
      emojiPickerAsideRef={emojiPickerRef}
      skinToneSpreadRef={skinToneSpreadRef}
    >
      <CategoriesNav
        emojiListRef={emojiListRef}
        categoriesNavRef={categoriesNavRef}
      />
      <Search
        searchPlaceholder={searchPlaceholder}
        emojiSearchRef={emojiSearchRef}
        skinToneSpreadRef={skinToneSpreadRef}
      />

      <div className="content-wrapper-epr">
        <VariationsMenu />
        <section className="emoji-scroll-wrapper" ref={emojiListRef}>
          <RecentlyUsed emojiListRef={emojiListRef} />
          <EmojiList emojiListRef={emojiListRef} />
        </section>
      </div>
    </Aside>
  );
};

function Aside({
  children,
  pickerStyle,
  emojiPickerAsideRef,
  skinToneSpreadRef,
}) {
  const closeVariations = useCloseVariationMenu();
  const collapseSkinTones = useCollapseSkinTones();
  return (
    <aside
      className="emoji-picker-react"
      style={pickerStyle}
      onScroll={() => {
        closeVariations();
        collapseSkinTones();
      }}
      onMouseDown={e => {
        closeVariations();

        // TODO: Add a more generic approach to handling disabled skinTone picker
        if (!skinToneSpreadRef.current?.contains(e.target)) {
          collapseSkinTones();
        }
      }}
      ref={emojiPickerAsideRef}
    >
      {children}
    </aside>
  );
}

Aside.propTypes = {
  children: PropTypes.node,
  pickerStyle: PropTypes.object,
  emojiPickerAsideRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
  skinToneSpreadRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
};

EmojiPickerContent.propTypes = {
  pickerStyle: PropTypes.objectOf(PropTypes.string),
  searchPlaceholder: PropTypes.string,
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
  ...customEmojiPropTypes,
  ...configPropTypes,
};
