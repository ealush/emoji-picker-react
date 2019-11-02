import React, { useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { GROUP_NAME_PEOPLE } from '../lib/constants';
import { PROPERTY_DATA_NAME } from './lib/constants';
import reducer, { PickerContext, actionTypes } from './lib/reducer';
import clickHandler from './lib/clickHandler';
import { getRecentlyUsed } from './lib/recentlyUsed';
import SkinTones, { SKIN_TONE_NEUTRAL, SKIN_TONE_LIGHT, SKIN_TONE_MEDIUM_LIGHT, SKIN_TONE_MEDIUM, SKIN_TONE_MEDIUM_DARK, SKIN_TONE_DARK, DATA_NAME } from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu';
import CategoriesNav from './components/CategoriesNav';
import EmojiList from './components/EmojiList';
import Search from './components/Search';
import './style.css';

const EmpojiPicker = ({ emojiUrl = DEFAULT_EMOJI_URL, onEmojiClick, preload = false, skinTone = SKIN_TONE_NEUTRAL }) => {
    const emojiListRef = useRef(null);

    const [state, dispatch] = useReducer(reducer, {
        activeSkinTone: skinTone,
        emojiUrl,
        onEmojiClick: clickHandler(onEmojiClick),
        seenGroups: { [GROUP_NAME_PEOPLE]: true },
        recentlyUsed: getRecentlyUsed(),
        preload
    });

    const closeVariations = ({ target }) => {
        if (state.variationMenu) {
            dispatch({ type: actionTypes.VARIATION_MENU_SET });
        }

        if (state.skinTonesSpread && target.getAttribute(PROPERTY_DATA_NAME) !== DATA_NAME) {
            dispatch({ type: actionTypes.SKIN_TONES_SPREAD });
        }
    };

    return (
        <PickerContext.Provider value={{ state, dispatch }}>
            <aside className="emoji-picker-react" onScroll={closeVariations} onMouseDown={closeVariations}>
                <CategoriesNav emojiListRef={emojiListRef}/>
                <div style={{position: 'relative'}}>
                    <Search/>
                    <SkinTones/>
                </div>
                <div className="content-wrapper" data-name={state.emojiName}>
                    <VariationsMenu closeVariations={closeVariations}/>
                    <EmojiList emojiListRef={emojiListRef}/>
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
    SKIN_TONE_DARK
};

export default EmpojiPicker;

EmpojiPicker.propTypes = {
    emojiUrl: PropTypes.string,
    onEmojiClick: PropTypes.func,
    preload: PropTypes.bool,
    skinTone: PropTypes.string
};
