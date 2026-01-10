const emojibaseData = require('emojibase-data/en/data.json');
const emojibaseGroups = require('emojibase-data/en/groups.json');
const { writeJSONSync, writeFileSync } = require('fs-extra');
const _ = require('lodash');

const keys = {
  EMOJI_PROPERTY_NAME: 'n',
  EMOJI_PROPERTY_UNIFIED: 'u',
  EMOJI_PROPERTY_SKIN_VARIATIONS: 'v',
  EMOJI_PROPERTY_GROUP: 'g',
  EMOJI_PROPERTY_ADDED_IN: 'a',
  GROUP_NAME_PEOPLE: 'smileys_people',
  GROUP_NAME_NATURE: 'animals_nature',
  GROUP_NAME_FOOD: 'food_drink',
  GROUP_NAME_TRAVEL: 'travel_places',
  GROUP_NAME_ACTIVITIES: 'activities',
  GROUP_NAME_OBJECTS: 'objects',
  GROUP_NAME_SYMBOLS: 'symbols',
  GROUP_NAME_FLAGS: 'flags',
  GROUP_NAME_SUGGESTED: 'suggested',
  GROUP_NAME_CUSTOM: 'custom'
};

const groupConversion = {
  [keys.GROUP_NAME_PEOPLE]: keys.GROUP_NAME_PEOPLE,
  smileys_emotion: keys.GROUP_NAME_PEOPLE,
  smileys_and_emotion: keys.GROUP_NAME_PEOPLE,
  custom: keys.GROUP_NAME_CUSTOM,
  people_body: keys.GROUP_NAME_PEOPLE,
  animals_nature: keys.GROUP_NAME_NATURE,
  food_drink: keys.GROUP_NAME_FOOD,
  travel_places: keys.GROUP_NAME_TRAVEL,
  activities: keys.GROUP_NAME_ACTIVITIES,
  objects: keys.GROUP_NAME_OBJECTS,
  symbols: keys.GROUP_NAME_SYMBOLS,
  flags: keys.GROUP_NAME_FLAGS,
  component: null,
  components: null,
  skin_tones: null
};

const emojis = _.sortBy(emojibaseData, ['order', 'hexcode']);

const groupEntries = Array.isArray(emojibaseGroups)
  ? emojibaseGroups
  : emojibaseGroups && Array.isArray(emojibaseGroups.groups)
  ? emojibaseGroups.groups
  : [];

const groupMap = new Map(
  groupEntries
    .map((group, index) => {
      const key = group.key || group.name || group.label || group;
      const id = group.index ?? group.id ?? group.order ?? index;
      return [id, key];
    })
    .filter(([id, key]) => id !== undefined && key !== undefined)
);

const normalizeGroupName = value =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toUnified = value =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const unicodeToUnified = emoji => {
  if (!emoji) {
    return '';
  }
  const codepoints = Array.from(emoji).map(char =>
    char.codePointAt(0).toString(16)
  );
  return codepoints.join('-');
};

const resolveGroupName = emoji => {
  if (emoji.group !== undefined && groupMap.has(emoji.group)) {
    return groupMap.get(emoji.group);
  }
  return emoji.group || emoji.groupKey || emoji.group_key || '';
};

const cleanEmoji = emoji => {
  const shortcodes = [
    ...(emoji.shortcodes || []),
    ...(emoji.shortcode ? [emoji.shortcode] : [])
  ];
  const names = [
    emoji.label,
    emoji.annotation,
    ...shortcodes,
    ...(emoji.tags || [])
  ]
    .filter(Boolean)
    .map(name => String(name).replace(/[_-]/g, ' '));

  const unified = toUnified(
    emoji.hexcode || emoji.hex || emoji.unicode || unicodeToUnified(emoji.emoji)
  );
  const addedIn = emoji.version ? String(emoji.version) : undefined;
  const variations = (emoji.skins || [])
    .map(skin =>
      toUnified(
        skin.hexcode ||
          skin.hex ||
          skin.unicode ||
          unicodeToUnified(skin.emoji)
      )
    )
    .filter(Boolean);

  return {
    [keys.EMOJI_PROPERTY_NAME]: [...new Set(names)].sort(
      (a, b) => a.length - b.length
    ),
    [keys.EMOJI_PROPERTY_UNIFIED]: unified,
    ...(variations.length
      ? { [keys.EMOJI_PROPERTY_SKIN_VARIATIONS]: variations }
      : {}),
    ...(addedIn ? { [keys.EMOJI_PROPERTY_ADDED_IN]: addedIn } : {})
  };
};

const { groupedEmojis } = emojis.reduce(
  ({ groupedEmojis }, emoji) => {
    const groupName = normalizeGroupName(resolveGroupName(emoji));
    const category = groupConversion[groupName] || groupName;

    if (!groupConversion[category]) {
      return {
        groupedEmojis
      };
    }

    groupedEmojis[category] = groupedEmojis[category] || [];

    groupedEmojis[category].push(cleanEmoji(emoji));
    return { groupedEmojis };
  },
  { groupedEmojis: { [keys.GROUP_NAME_CUSTOM]: [] } }
);

writeJSONSync('./src/data/emojis.json', groupedEmojis, 'utf8');
writeFileSync(
  './src/data/emojis.ts',
  `export default ${JSON.stringify(groupedEmojis)}`,
  'utf8'
);
