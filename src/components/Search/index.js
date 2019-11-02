import React from 'react';
import useFilter from '../../hooks/useFilter';
import './style.css';

const Search = () => (
    <input className="emoji-search"
        onChange={useFilter()}
        autoFocus/>
);

export default Search;
