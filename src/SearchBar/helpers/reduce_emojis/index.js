import { emojis, keywords } from '../../../emoji-data';
import emojiAccessor from '../../../emoji-data/emoji_accessor';

export default function reduceEmojis(matches) {
    return matches.reduce((accumulator, keyword) => {
        keywords[keyword].forEach((emoji) => {
            const current = emojiAccessor(emojis[emoji]);

            if (!current) {
                return;
            }

            const catName = current.category;

            accumulator[catName] = accumulator[catName] || {};
            accumulator[catName][emoji] = keyword;
        });
        return accumulator;
    }, {});
}