import React, { useState, useReducer } from 'react';
import Aside from './styled';
import EmojiList from './components/EmojiList/';
import Search, { useFilter, FilterContext } from './components/Search/';

const EmpojiPicker = () => {
    const [ onFilterChange, filteredEmojis ] = useFilter();

    return (
        <FilterContext.Provider value={filteredEmojis}>
            <Aside>
                <Search handleChange={onFilterChange}/>
                <EmojiList/>
            </Aside>
        </FilterContext.Provider>
    );
};

export default EmpojiPicker;