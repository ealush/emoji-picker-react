import React from 'react';
import Aside from './styled';
import EmojiList from './components/EmojiList/';
import Search from './components/Search/';

const EmpojiPicker = () => {


    return (
        <Aside>
            <Search/>
            <EmojiList/>
        </Aside>
    );
};

export default EmpojiPicker;