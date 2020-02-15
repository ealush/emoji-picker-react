import { useContext } from 'react';
import reduceBatch from '../../lib/reduceBatch';
import { EMOJI_PROPERTY_GROUP } from '../../lib/constants';
import emojiStorage from '../../lib/emojiStorage';
import { PickerContext, actionTypes } from '../lib/reducer';
import keywordsPromise from '../../lib/initSearch';

let searchTerms, mappedSearchTerms;

keywordsPromise.then((res) => {
    searchTerms = res.searchTerms;
    mappedSearchTerms = res.mappedSearchTerms;
});

window.es = emojiStorage;

const useFilter = () => {
    const { state: { filter = [] }, dispatch } = useContext(PickerContext);

    const handleChange = ({ target: { value } }) => {
        const prevKey = filter[filter.length - 1];
        let nextFilter;

        value = value.trim().toLowerCase();

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
        const filterPresent = !!(last && last.value);

        if (!filterPresent) {
            dispatch({
                type: actionTypes.FILTER_SET,
                filter: nextFilter,
                filterResult: null
            });
            return;
        }

        reduceBatch((last && last.terms || []), (accumulator, term) => {
            if (!searchTerms[term]){ return accumulator; }

            return (searchTerms[term] || []).reduce((accumulator, unified) => {
                const group = emojiStorage.emojis[unified][EMOJI_PROPERTY_GROUP];
                accumulator[group] = accumulator[group] || {};
                accumulator[group][unified] = true;
                return accumulator;
            }, accumulator);
        }, {}).then((filterResult) => {
            dispatch({
                type: actionTypes.FILTER_SET,
                filter: nextFilter,
                filterResult
            });
        });
    };

    return handleChange;
};

export default useFilter;
