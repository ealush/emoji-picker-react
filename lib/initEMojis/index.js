import emojis from 'emoji-datasource/emoji_pretty';

const search = {}

export const { groupedEmojis, skinTones } = emojis.reduce(({ skinTones, groupedEmojis}, emoji) => {
    if (emoji.category === 'Skin Tones') {
        return {
            groupedEmojis,
            skinTones: [...skinTones, emoji]
        };
    }

    const category = emoji.category.toLowerCase();
    emoji.unified = emoji.unified.toLowerCase()
    groupedEmojis[category] = groupedEmojis[category] || [];
    groupedEmojis[category].push(emoji);
    return { skinTones, groupedEmojis };
}, {groupedEmojis: {}, skinTones: []});

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

export const groups = Object.keys(groupedEmojis);

console.log(skinTones);