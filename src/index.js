import React, { useState, useReducer } from 'react';
import reducer, { PickerContext, actionTypes } from './lib/reducer';
import SkinTones, { NEUTRAL, DATA_NAME } from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu/';
import EmojiList from './components/EmojiList/';
import Search, { useFilter } from './components/Search/';
import Aside from './styled';

const EmpojiPicker = () => {
    const [state, dispatch] = useReducer(reducer, {
        activeSkinTone: NEUTRAL
    });
    const [ activeSkinTone, setActiveSkinTone ] = useState(NEUTRAL);

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
                <Search/>
                <SkinTones activeSkinTone={activeSkinTone}
                    setActiveSkinTone={setActiveSkinTone}/>
                <VariationsMenu/>
                <EmojiList/>
            </Aside>
        </PickerContext.Provider>
    );
};

export default EmpojiPicker;
