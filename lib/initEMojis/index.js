import pretty from 'emoji-datasource/emoji_pretty';

const emojis = JSON.parse(JSON.stringify(pretty).toLowerCase())

const search = {}

export const { groupedEmojis, skinTones } = emojis.reduce(({ skinTones, groupedEmojis}, emoji) => {
    if (emoji.category === 'skin tones') {
        return {
            groupedEmojis,
            skinTones: [...skinTones, emoji.unified]
        };
    }

    const category = emoji.category;
    emoji.unified = emoji.unified;
    groupedEmojis[category] = groupedEmojis[category] || [];
    groupedEmojis[category].push(emoji);
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
        accumulator[key][emoji.unified] = 1;
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
