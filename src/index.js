import React, { useState, useReducer } from 'react';
import reducer, { PickerContext, actionTypes } from './lib/reducer';
import SkinTones, { NEUTRAL, DATA_NAME } from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu/';
import EmojiList from './components/EmojiList/';
import Search, { useFilter, FilterContext } from './components/Search/';
import Aside from './styled';

const EmpojiPicker = () => {
    const [state, dispatch] = useReducer(reducer, {
        activeSkinTone: NEUTRAL
    });
    const [ onFilterChange, filteredEmojis ] = useFilter();
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
        <FilterContext.Provider value={filteredEmojis}>
            <Aside onScroll={closeVariations} onMouseDown={closeVariations}>
                <Search cancel={onFilterChange}/>
                <SkinTones activeSkinTone={activeSkinTone}
                    setActiveSkinTone={setActiveSkinTone}/>
                <VariationsMenu/>
                <EmojiList/>
            </Aside>
        </FilterContext.Provider>
        </PickerContext.Provider>
    );
};

export default EmpojiPicker;