const fs = require('fs');
const _ = require('lodash');
const pretty = require('emoji-datasource/emoji_pretty');
const constants = require('../constants');

const emojis = _.sortBy(JSON.parse(JSON.stringify(pretty).toLowerCase()), 'sort_order');

const cleanEmoji = (emoji) => {
    emoji.short_names = emoji.short_names || [];
    emoji[constants.EMOJI_PROPERTY_NAME] = [...new Set([emoji.name, ...emoji.short_names, emoji.short_name].filter(Boolean))];
    emoji[constants.EMOJI_PROPERTY_UNIFIED] = emoji.unified;

    if (emoji.skin_variations) {
        emoji[constants.EMOJI_PROPERTY_SKIN_VARIATIONS] = Object.values(_.mapValues(emoji.skin_variations, 'unified'));
    }

    return _.pick(emoji, [constants.EMOJI_PROPERTY_NAME, constants.EMOJI_PROPERTY_UNIFIED, constants.EMOJI_PROPERTY_SKIN_VARIATIONS]);
};

const { groupedEmojis } = emojis.reduce(({ groupedEmojis }, emoji) => {
    if (emoji.category === 'skin tones') {
        return {
            groupedEmojis
        };
    }

    const category = emoji.category;
    groupedEmojis[category] = groupedEmojis[category] || [];
    groupedEmojis[category].push(cleanEmoji(emoji));
    return { groupedEmojis };
}, {groupedEmojis: {}});

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
fs.writeFileSync('./src/skinTones.json', JSON.stringify(['neutral','1f3fb','1f3fc','1f3fd','1f3fe','1f3ff']), 'utf8');
fs.writeFileSync('./src/groups.json', JSON.stringify(groups), 'utf8');
