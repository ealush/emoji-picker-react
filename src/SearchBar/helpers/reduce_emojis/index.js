import { emojis, keywords, categories } from '../../../emoji-data';

export default function reduceEmojis(matches) {
    return matches.reduce((accumulator, keyword) => {
        keywords[keyword].forEach((emoji) => {
            const current = emojis[emoji];

            if (!current) {
                return;
            }

            const catName = categories[current.category].name;

            accumulator[catName] = accumulator[catName] || {};
            accumulator[catName][emoji] = keyword;
        });
        return accumulator;
    }, {});
}