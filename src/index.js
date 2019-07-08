import React, { useState, useReducer, useRef } from 'react';
import reducer, { PickerContext, actionTypes } from './lib/reducer';
import SkinTones, { NEUTRAL, DATA_NAME } from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu/';
import CategoriesNav from './components/CategoriesNav/';
import EmojiList from './components/EmojiList/';
import Search, { useFilter } from './components/Search/';
import Aside from './styled';

const EmpojiPicker = () => {
    const [state, dispatch] = useReducer(reducer, { activeSkinTone: NEUTRAL });
    const [ activeSkinTone, setActiveSkinTone ] = useState(NEUTRAL);
    const emojiListRef = useRef(null);

    const closeVariations = ({ target }) => {
        if (state.variationMenu) {
            dispatch({ type: actionTypes.VARIATION_MENU_SET });
        }

        if (state.skinTonesSpread && target.getAttribute('data-name') !== DATA_NAME) {
            dispatch({ type: actionTypes.SKIN_TONES_SPREAD })
        }
    }

    return (
        <PickerContext.Provider value={{ state, dispatch }}>
            <Aside onScroll={closeVariations} onMouseDown={closeVariations}>
                <CategoriesNav emojiListRef={emojiListRef}/>
                <div style={{position: 'relative'}}>
                    <Search/>
                    <SkinTones activeSkinTone={activeSkinTone}
                        setActiveSkinTone={setActiveSkinTone}/>
                </div>
                <VariationsMenu/>
                <EmojiList emojiListRef={emojiListRef}/>
            </Aside>
        </PickerContext.Provider>
    );
};

export default EmpojiPicker;
