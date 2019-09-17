import React, { useState, useReducer, useRef } from 'react';
import reducer, { PickerContext, actionTypes } from './lib/reducer';
import { GROUP_NAME_PEOPLE } from '../lib/constants';
import useIntersectionObserver from './hooks/useIntersectionObserver';
import SkinTones, { NEUTRAL, DATA_NAME } from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu';
import CategoriesNav from './components/CategoriesNav';
import EmojiList from './components/EmojiList';
import Search from './components/Search';
import './style.css';


const EmpojiPicker = ({ emojiUrl = DEFAULT_EMOJI_URL, onEmojiClick }) => {
    const [state, dispatch] = useReducer(reducer, {
        activeSkinTone: NEUTRAL,
        emojiUrl,
        onEmojiClick,
        seenGroups: { [GROUP_NAME_PEOPLE]: true }
    });
    const [ activeSkinTone, setActiveSkinTone ] = useState(NEUTRAL);
    const emojiListRef = useRef(null);

    useIntersectionObserver(emojiListRef, state.filter, state, dispatch);

    const closeVariations = ({ target }) => {
        if (state.variationMenu) {
            dispatch({ type: actionTypes.VARIATION_MENU_SET });
        }

        if (state.skinTonesSpread && target.getAttribute('data-name') !== DATA_NAME) {
            dispatch({ type: actionTypes.SKIN_TONES_SPREAD });
        }
    };


    return (
        <PickerContext.Provider value={{ state, dispatch }}>
            <aside className="emoji-picker-react" onScroll={closeVariations} onMouseDown={closeVariations}>
                <CategoriesNav emojiListRef={emojiListRef}/>
                <div style={{position: 'relative'}}>
                    <Search/>
                    <SkinTones activeSkinTone={activeSkinTone}
                        setActiveSkinTone={setActiveSkinTone}/>
                </div>
                <div className="content-wrapper" data-name={state.emojiName}>
                    <VariationsMenu closeVariations={closeVariations}/>
                    <EmojiList emojiListRef={emojiListRef}/>
                </div>
            </aside>
        </PickerContext.Provider>
    );
};

export default EmpojiPicker;
