import reduceBatch from '../reduceBatch';
import groupedEmojis from '../../src/emojis.json';

import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_NAME } from '../constants';

const allEmojis = Array.prototype.concat.apply([], Object.values(groupedEmojis));

export default reduceBatch(allEmojis, (accumulator, emoji) => {

    if (!emoji) {
        return accumulator;
    }

    return emoji[EMOJI_PROPERTY_NAME].reduce((accumulator, term) => (
        [...accumulator, ...(term || '').split(/[- _]/)].filter(Boolean)
    ), []).reduce((accumulator, term) => {
        const key = term.toLowerCase();
        accumulator[key] = accumulator[key] || [];

        accumulator[key].push(emoji[EMOJI_PROPERTY_UNIFIED]);
        return accumulator;
    }, accumulator);
}, {}).then((searchTerms) => reduceBatch(Object.keys(searchTerms), (accumulator, term) => {
    if (!term) {
        return accumulator;
    }

    const chars = term.split('').filter(Boolean);

    return (chars || []).reduce((accumulator, char) => {
        accumulator[char] = accumulator[char] || [];
        if (!accumulator[char].includes(term)) {
            accumulator[char].push(term);
        }
        return accumulator;
    },accumulator);
}, {}).then((mappedSearchTerms) => {
    return {
        searchTerms,
        mappedSearchTerms
    };
}));
