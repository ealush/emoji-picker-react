import React from 'react';
import useFilter from '../../hooks/useFilter';
import './style.css';

const Search = () => {
    const handleChange = useFilter();
    return (
        <input className="emoji-search" onChange={handleChange}/>
    );
};

export default Search;
