import _ from 'lodash';
import pretty from 'emoji-datasource/emoji_pretty';
import {EMOJI_PROPERTY_NAME, EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_SORT_ORDER, EMOJI_PROPERTY_SKIN_VARIATIONS} from '../../src/lib/constants';

const emojis = JSON.parse(JSON.stringify(pretty).toLowerCase());

const search = {}

const cleanEmoji = (emoji) => {
    emoji.n = emoji.name;
    emoji.u = emoji.unified;
    emoji.o = emoji.sort_order;

    if (emoji.skin_variations) {
        emoji.v = Object.values(_.mapValues(emoji.skin_variations, 'unified'));
    }

    return _.pick(emoji, ['n', 'u', 'o', 'v']);
}

export const { groupedEmojis, skinTones } = emojis.reduce(({ skinTones, groupedEmojis}, emoji) => {
    if (emoji.category === 'skin tones') {
        return {
            groupedEmojis,
            skinTones: [...skinTones, emoji[EMOJI_PROPERTY_UNIFIED]]
        };
    }

    const category = emoji.category;
    groupedEmojis[category] = groupedEmojis[category] || [];
    groupedEmojis[category].push(cleanEmoji(emoji));
    return { skinTones, groupedEmojis };
}, {groupedEmojis: {}, skinTones: ['neutral']});

export const searchTerms = emojis.reduce((accumulator, emoji) => {
    emoji.short_names = emoji.short_names || [];
    emoji.short_names = [...emoji.short_names, emoji.name, emoji.short_name];

    return emoji.short_names.reduce((accumulator, term) => (
        [...accumulator, ...(term || '').split(/[- _]/)].filter(Boolean)
    ), []).reduce((accumulator, term) => {
        const key = term.toLowerCase();
        accumulator[key] = accumulator[key] || {};
        accumulator[key][emoji[EMOJI_PROPERTY_UNIFIED]] = 1;
        return accumulator;
    }, accumulator);
}, {});

export const mappedSearchTerms = Object.keys(searchTerms).reduce((accumulator, term) => {
    const chars = term.split('').filter(Boolean);

    return (chars || []).reduce((accumulator, char) => {
        accumulator[char] = accumulator[char] || [];
        if (!accumulator[char].includes(term)) {
            accumulator[char].push(term)
        }
        return accumulator;
    },accumulator)
}, {});

export const groups = ['smileys & people', 'animals & nature', 'food & drink', 'travel & places', 'activities', 'objects', 'symbols', 'flags'];
