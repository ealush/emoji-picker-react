const fs = require('fs');
const _ = require('lodash');
const pretty = require('emoji-datasource/emoji_pretty');
const { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_NAME, EMOJI_PROPERTY_SORT_ORDER, EMOJI_PROPERTY_SKIN_VARIATIONS } = require('../constants');

const emojis = JSON.parse(JSON.stringify(pretty).toLowerCase());

const cleanEmoji = (emoji) => {
    emoji.short_names = emoji.short_names || [];
    emoji[EMOJI_PROPERTY_NAME] = [...new Set([emoji.name, ...emoji.short_names, emoji.short_name])];
    emoji[EMOJI_PROPERTY_UNIFIED] = emoji.unified;
    emoji[EMOJI_PROPERTY_SORT_ORDER] = emoji.sort_order;

    if (emoji.skin_variations) {
        emoji[EMOJI_PROPERTY_SKIN_VARIATIONS] = Object.values(_.mapValues(emoji.skin_variations, 'unified'));
    }

    return _.pick(emoji, [EMOJI_PROPERTY_NAME, EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_SORT_ORDER, EMOJI_PROPERTY_SKIN_VARIATIONS]);
}

const { groupedEmojis, skinTones } = emojis.reduce(({ skinTones, groupedEmojis }, emoji) => {
    if (emoji.category === 'skin tones') {
        return {
            groupedEmojis,
            skinTones: [...skinTones, cleanEmoji(emoji)[EMOJI_PROPERTY_UNIFIED]]
        };
    }

    const category = emoji.category;
    groupedEmojis[category] = groupedEmojis[category] || [];
    groupedEmojis[category].push(cleanEmoji(emoji));
    return { skinTones, groupedEmojis };
}, {groupedEmojis: {}, skinTones: ['neutral']});

const groups = ['smileys & people', 'animals & nature', 'food & drink', 'travel & places', 'activities', 'objects', 'symbols', 'flags'];

fs.writeFileSync('./src/emojis.json', JSON.stringify(groupedEmojis), 'utf8');
fs.writeFileSync('./src/skinTones.json', JSON.stringify(skinTones), 'utf8');
fs.writeFileSync('./src/groups.json', JSON.stringify(groups), 'utf8');
