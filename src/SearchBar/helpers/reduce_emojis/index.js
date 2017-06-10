import emojis from '../../../emoji-data/emoji-list';
import emojiKeywords from '../../../emoji-data/emoji-keywords';

export default function reduceEmojis(matches) {
    return matches.reduce((accumulator, keyword) => {
        emojiKeywords[keyword].forEach((emoji) => {
            accumulator[emojis[emoji].category] = accumulator[emojis[emoji].category] || {};
            accumulator[emojis[emoji].category][emoji] = keyword;
        });
        return accumulator;
    }, {});
}