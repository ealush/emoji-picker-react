import React, { useState, useContext } from 'react';
import { searchTerms, mappedSearchTerms } from '../../../lib/initEMojis';
import { PickerContext, actionTypes } from '../../lib/reducer';
import Input from './styled';

export const useFilter = () => {
    const { state: { filter = [] }, dispatch } = useContext(PickerContext);

    const handleChange = ({ target: { value } }) => {
        const prevKey = filter[filter.length - 1];
        let nextFilter;

        if (value.length === 1) {
            nextFilter = [{
                value,
                terms: mappedSearchTerms[value]
            }];
        } else if (prevKey && value.length > prevKey.value.length && value.includes(prevKey.value)) {
            nextFilter = [...filter, {
                value,
                terms: prevKey.terms.filter((term) => term.includes(value))
            }];
        } else if (prevKey && value.length < prevKey.value.length && prevKey.value.includes(value)) {
            let sliceIndex = 0;
            for (let index = filter.length; index > 0; index--) {
                if (value.includes(filter[index - 1].value)) {
                    sliceIndex = index;
                    break;
                }
            }

            filter.length = sliceIndex;
            nextFilter = [...filter];
        } else if (filter.length === 0 || !value.includes(prevKey.value)) {
            nextFilter = [{
                value,
                terms: mappedSearchTerms[value[0]].filter((term) => term.includes(value))
            }];
        }

        const last = nextFilter[nextFilter.length - 1];

        const filterPresent = !!last && last.value;

        const filterResult = filterPresent
        ? (last && last.terms || []).reduce((accumulator, term) => {
            if (!searchTerms[term]){ return accumulator; }
            return ({
                ...accumulator,
                ...searchTerms[term]
            });
        }, {})
        : null;

        dispatch({
            type: actionTypes.FILTER_SET,
            filter: nextFilter,
            filterResult
        });
    }

    return handleChange;
}

const Search = () => {
    const handleChange = useFilter()
    return (
        <Input onChange={handleChange}/>
    );
}

export default Search;
