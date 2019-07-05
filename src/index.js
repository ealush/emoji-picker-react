import React, { useState } from 'react';
import SkinTones, { NEUTRAL, SkinToneContext } from './components/SkinTones';
import EmojiList from './components/EmojiList/';
import Search, { useFilter, FilterContext } from './components/Search/';
import Aside from './styled';

const EmpojiPicker = () => {
    const [ onFilterChange, filteredEmojis ] = useFilter();
    const [ activeSkinTone, setActiveSkinTone ] = useState(NEUTRAL)

    return (
        <SkinToneContext.Provider value={activeSkinTone}>
        <FilterContext.Provider value={filteredEmojis}>
            <Aside>
                <Search handleChange={onFilterChange}/>
                <SkinTones activeSkinTone={activeSkinTone}
                    setActiveSkinTone={setActiveSkinTone}/>
                <EmojiList/>
            </Aside>
        </FilterContext.Provider>
        </SkinToneContext.Provider>
    );
};

export default EmpojiPicker;