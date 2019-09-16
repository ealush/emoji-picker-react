const fs = require('fs');
const _ = require('lodash');
const pretty = require('emoji-datasource/emoji_pretty');
const constants = require('../constants');

const emojis = JSON.parse(JSON.stringify(pretty).toLowerCase());

const cleanEmoji = (emoji) => {
    emoji.short_names = emoji.short_names || [];
    emoji[constants.EMOJI_PROPERTY_NAME] = [...new Set([emoji.name, ...emoji.short_names, emoji.short_name])];
    emoji[constants.EMOJI_PROPERTY_UNIFIED] = emoji.unified;
    emoji[constants.EMOJI_PROPERTY_SORT_ORDER] = emoji.sort_order;

    if (emoji.skin_variations) {
        emoji[constants.EMOJI_PROPERTY_SKIN_VARIATIONS] = Object.values(_.mapValues(emoji.skin_variations, 'unified'));
    }

    return _.pick(emoji, [constants.EMOJI_PROPERTY_NAME, constants.EMOJI_PROPERTY_UNIFIED, constants.EMOJI_PROPERTY_SORT_ORDER, constants.EMOJI_PROPERTY_SKIN_VARIATIONS]);
}

const { groupedEmojis, skinTones } = emojis.reduce(({ skinTones, groupedEmojis }, emoji) => {
    if (emoji.category === 'skin tones') {
        return {
            groupedEmojis,
            skinTones: [...skinTones, cleanEmoji(emoji)[constants.EMOJI_PROPERTY_UNIFIED]]
        };
    }

    const category = emoji.category;
    groupedEmojis[category] = groupedEmojis[category] || [];
    groupedEmojis[category].push(cleanEmoji(emoji));
    return { skinTones, groupedEmojis };
}, {groupedEmojis: {}, skinTones: ['neutral']});

const groups = [
    constants.GROUP_NAME_PEOPLE,
    constants.GROUP_NAME_NATURE,
    constants.GROUP_NAME_FOOD,
    constants.GROUP_NAME_TRAVEL,
    constants.GROUP_NAME_ACTIVITIES,
    constants.GROUP_NAME_OBJECTS,
    constants.GROUP_NAME_SYMBOLS,
    constants.GROUP_NAME_FLAGS
];

fs.writeFileSync('./src/emojis.json', JSON.stringify(groupedEmojis), 'utf8');
fs.writeFileSync('./src/skinTones.json', JSON.stringify(skinTones), 'utf8');
fs.writeFileSync('./src/groups.json', JSON.stringify(groups), 'utf8');
