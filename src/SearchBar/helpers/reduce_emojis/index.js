import emojis from '../../../emoji-data/emoji-list.json';
import emojiKeywords from '../../../emoji-data/keywords.json';

export default function reduceEmojis(matches) {
    return matches.reduce((accumulator, keyword) => {
        emojiKeywords[keyword].forEach((emoji) => {
            const current = emojis[emoji];

            if (!current) {
                return;
            }

            accumulator[current.category] = accumulator[current.category] || {};
            accumulator[current.category][emoji] = keyword;
        });
        return accumulator;
    }, {});
}