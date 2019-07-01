import React, { useState } from 'react';
import { searchTerms, mappedSearchTerms } from '../../../lib/initEMojis';

const Search = () => {
    const [filter, setFilter] = useState([]);

    const handleChange = ({ target: { value } }) => {
        const prevKey = filter[filter.length - 1];
        if (value.length === 1) {
            setFilter([{
                value,
                terms: mappedSearchTerms[value]
            }]);
        } else if (value.length > prevKey.value.length && value.includes(prevKey.value)) {
            setFilter([...filter, {
                value,
                terms: prevKey.terms.filter((term) => term.includes(value))
            }]);
        } else if (value.length < prevKey.value.length && prevKey.value.includes(value)) {
            let sliceIndex = 0;
            for (let index = filter.length; index > 0; index--) {
                if (value.includes(filter[index - 1].value)) {
                    sliceIndex = index;
                    break;
                }
            }
            setFilter((prevFilter) => {
                prevFilter.length = sliceIndex;
                return [...prevFilter];
            });
        } else if (filter.length === 0 || !value.includes(prevKey.value)) {
            setFilter([{
                value,
                terms: mappedSearchTerms[value[0]].filter((term) => term.includes(value))
            }]);
        }
    }

    console.log(filter);

    return (
        <input type="text" onChange={handleChange}/>
    );
}

export default Search;