import React, { useState, useReducer } from 'react';
import reducer, { PickerContext } from './lib/reducer';
import SkinTones, { NEUTRAL, SkinToneContext } from './components/SkinTones';
import VariationsMenu from './components/VariationsMenu/';
import EmojiList from './components/EmojiList/';
import Search, { useFilter, FilterContext } from './components/Search/';
import Aside from './styled';

const EmpojiPicker = () => {
    const [state, dispatch] = useReducer(reducer, {});
    const [ onFilterChange, filteredEmojis ] = useFilter();
    const [ activeSkinTone, setActiveSkinTone ] = useState(NEUTRAL);

    return (
        <PickerContext.Provider value={{ state, dispatch }}>
        <SkinToneContext.Provider value={activeSkinTone}>
        <FilterContext.Provider value={filteredEmojis}>
            <Aside>
                <Search handleChange={onFilterChange}/>
                <SkinTones activeSkinTone={activeSkinTone}
                    setActiveSkinTone={setActiveSkinTone}/>
                <VariationsMenu/>
                <EmojiList/>
            </Aside>
        </FilterContext.Provider>
        </SkinToneContext.Provider>
        </PickerContext.Provider>
    );
};

export default EmpojiPicker;