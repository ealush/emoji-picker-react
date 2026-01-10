import emojibaseData from 'emojibase-data/en/data.json';
import emojibaseGroups from 'emojibase-data/en/groups.json';
import { writeJSONSync, writeFileSync } from 'fs-extra';

type GroupEntry =
  | string
  | {
      key?: string;
      name?: string;
      label?: string;
      index?: number;
      id?: number;
      order?: number;
    };

type EmojiSkin = {
  hexcode?: string;
  hex?: string;
  unicode?: string;
  emoji?: string;
};

type EmojiRecord = {
  annotation?: string;
  label?: string;
  shortcodes?: string[];
  shortcode?: string;
  tags?: string[];
  hexcode?: string;
  hex?: string;
  unicode?: string;
  emoji?: string;
  version?: number | string;
  skins?: EmojiSkin[];
  group?: number | string;
  groupKey?: string;
  group_key?: string;
  order?: number;
};

type CleanEmoji = {
  n: string[];
  u: string;
  v?: string[];
  a?: string;
};

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
} as const;

const groupConversion: Record<string, string | null> = {
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

const emojis = [...(emojibaseData as EmojiRecord[])].sort((a, b) => {
  const orderA = a.order ?? 0;
  const orderB = b.order ?? 0;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  const hexA = a.hexcode || '';
  const hexB = b.hexcode || '';
  return hexA.localeCompare(hexB);
});

const groupEntries: GroupEntry[] = Array.isArray(emojibaseGroups)
  ? (emojibaseGroups as GroupEntry[])
  : emojibaseGroups && Array.isArray((emojibaseGroups as { groups?: GroupEntry[] }).groups)
  ? ((emojibaseGroups as { groups: GroupEntry[] }).groups)
  : [];

const groupPairs: Array<[number | string, string]> = [];

groupEntries.forEach((group, index) => {
  if (typeof group === 'string') {
    groupPairs.push([index, group]);
    return;
  }

  const key = group.key || group.name || group.label;
  const id = group.index ?? group.id ?? group.order ?? index;

  if (key !== undefined && id !== undefined) {
    groupPairs.push([id, key]);
  }
});

const groupMap = new Map<number | string, string>(groupPairs);

const normalizeGroupName = (value: string | number | null | undefined) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toUnified = (value: string | number | null | undefined) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const unicodeToUnified = (emoji: string | undefined) => {
  if (!emoji) {
    return '';
  }
  const codepoints = Array.from(emoji).map(char =>
    (char.codePointAt(0) || 0).toString(16)
  );
  return codepoints.join('-');
};

const resolveGroupName = (emoji: EmojiRecord) => {
  if (emoji.group !== undefined && groupMap.has(emoji.group)) {
    return groupMap.get(emoji.group);
  }
  return emoji.group || emoji.groupKey || emoji.group_key || '';
};

const cleanEmoji = (emoji: EmojiRecord): CleanEmoji => {
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

const initialGroupedEmojis: Record<string, CleanEmoji[]> = {
  [keys.GROUP_NAME_CUSTOM]: []
};

const { groupedEmojis } = emojis.reduce<{
  groupedEmojis: Record<string, CleanEmoji[]>;
}>(
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
  { groupedEmojis: initialGroupedEmojis }
);

writeJSONSync('./src/data/emojis.json', groupedEmojis, 'utf8');
writeFileSync(
  './src/data/emojis.ts',
  `export default ${JSON.stringify(groupedEmojis)}`,
  'utf8'
);
