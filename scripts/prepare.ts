/**
 * @module scripts/prepare.ts
 * @description This script generates the localized emoji data files used by the library.
 * It reads raw emoji data from `emojibase-data`, processes it to match the internal data structure,
 * and writes TypeScript files (`emojis-<lang>.ts`) containing grouped emojis and localized category names.
 *
 * Flow:
 * 1. Identify available languages from `node_modules/emojibase-data`.
 * 2. For each language:
 *    a. Read `data.json` (emoji definitions) and `messages.json` (localized strings).
 *    b. Sort emojis by order and hex code.
 *    c. Group emojis into internal categories (e.g., 'smileys_people', 'animals_nature').
 *    d. Construct a localized category map, merging `messages.json` with internal UI keys.
 *    e. Write the output to `src/data/emojis-<lang>.ts`.
 * 3. For English ('en'), also update `src/data/emojis.ts` as the default export.
 */

import { join } from 'path';

import emojibaseGroups from 'emojibase-data/meta/groups.json'; // eslint-disable-line import/extensions
// eslint-disable-next-line import/no-extraneous-dependencies
import emojiDataSource from 'emoji-datasource/emoji.json'; // eslint-disable-line import/extensions
import {
  lstatSync,
  pathExistsSync,
  readdirSync,
  readJsonSync,
  writeFileSync,
  writeJSONSync,
  // @ts-ignore
} from 'fs-extra';

import {
  CleanEmoji,
  EMOJI_BASE_DATA_PATH,
  EmojiRecord,
  GroupEntry,
  LocalizedCategories,
  OutputData,
  groupConversion,
  internalCategoryNames,
  keys,
} from './constants';

const emojiDataSourceUnifieds = new Set<string>(
  emojiDataSource.map((emoji: any) => emoji.unified),
);

// --- Helper Functions ---

/**
 * Parses `emojibaseGroups` to create a Map of group ID to group Key.
 */
const getGroupEntries = (): GroupEntry[] => {
  if (Array.isArray(emojibaseGroups)) {
    return emojibaseGroups as GroupEntry[];
  }
  if (
    emojibaseGroups &&
    typeof emojibaseGroups === 'object' &&
    'groups' in emojibaseGroups &&
    Array.isArray((emojibaseGroups as any).groups)
  ) {
    return (emojibaseGroups as any).groups as GroupEntry[];
  }
  return [];
};

function getGroupMap(): Map<number | string, string> {
  // Handle Object-based structure (id -> key)
  if (
    emojibaseGroups.groups &&
    !Array.isArray(emojibaseGroups.groups) &&
    typeof emojibaseGroups.groups === 'object'
  ) {
    return new Map(
      Object.entries(emojibaseGroups.groups).map(([id, key]) => [
        parseInt(id, 10),
        key as string,
      ]),
    );
  }

  // Handle Array-based structure
  const groupEntries = getGroupEntries();

  const entries = groupEntries
    .map((group, index): [number | string, string] | null => {
      if (typeof group === 'string') {
        return [index, group];
      }

      const key = group.key || group.name || group.label;
      const id = group.index ?? group.id ?? group.order ?? index;

      return key !== undefined ? [id, key] : null;
    })
    .filter((entry): entry is [number | string, string] => entry !== null);

  return new Map(entries);
}

const groupMap = getGroupMap();

const normalizeGroupName = (
  value: string | number | null | undefined,
): string =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toUnified = (value: string | number | null | undefined): string =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

const unicodeToUnified = (emoji: string | undefined): string => {
  if (!emoji) {
    return '';
  }
  return Array.from(emoji)
    .map((char) => (char.codePointAt(0) || 0).toString(16))
    .join('-');
};

const resolveGroupName = (emoji: EmojiRecord): string => {
  if (emoji.group !== undefined && groupMap.has(emoji.group)) {
    return groupMap.get(emoji.group) || '';
  }
  return String(emoji.group || emoji.groupKey || emoji.group_key || '');
};

/**
 * Transforms an `EmojiRecord` from emojibase into an optimized `CleanEmoji` object.
 */
const getNames = (emoji: EmojiRecord): string[] => {
  return [
    emoji.label,
    emoji.annotation,
    ...(emoji.shortcodes || []),
    ...(emoji.shortcode ? [emoji.shortcode] : []),
    ...(emoji.tags || []),
  ]
    .filter(Boolean)
    .map((name) => String(name).replace(/[_-]/g, ' '));
};

const getSkins = (emoji: EmojiRecord): string[] => {
  return (emoji.skins || [])
    .map((skin) =>
      toUnified(
        skin.hexcode ||
          skin.hex ||
          skin.unicode ||
          unicodeToUnified(skin.emoji),
      ),
    )
    .filter(Boolean);
};

const cleanEmoji = (emoji: EmojiRecord): CleanEmoji => {
  const unified = toUnified(
    emoji.hexcode ||
      emoji.hex ||
      emoji.unicode ||
      unicodeToUnified(emoji.emoji),
  );

  const clean: CleanEmoji = {
    [keys.EMOJI_PROPERTY_NAME]: [...new Set(getNames(emoji))].sort(
      (a, b) => a.length - b.length,
    ),
    [keys.EMOJI_PROPERTY_UNIFIED]: unified,
  };

  const variations = getSkins(emoji);
  if (variations.length) {
    clean[keys.EMOJI_PROPERTY_SKIN_VARIATIONS] = variations;
  }

  if (emoji.version) {
    clean[keys.EMOJI_PROPERTY_ADDED_IN] = String(emoji.version);
  }

  return clean;
};

function getAvailableLanguages(): string[] {
  return readdirSync(EMOJI_BASE_DATA_PATH).filter((file: string) => {
    const filePath = join(EMOJI_BASE_DATA_PATH, file);
    return (
      lstatSync(filePath).isDirectory() &&
      !['meta', 'versions'].includes(file) &&
      pathExistsSync(join(filePath, 'data.json'))
    );
  });
}

// --- Logic Steps ---

function readEmojiData(lang: string): {
  emojisInfo: EmojiRecord[];
  messages: { groups: { key: string; message: string }[] } | null;
} {
  const dataPath = join(EMOJI_BASE_DATA_PATH, lang, 'data.json');
  const messagesPath = join(EMOJI_BASE_DATA_PATH, lang, 'messages.json');

  const emojisInfo: EmojiRecord[] = readJsonSync(dataPath);
  let messages = null;

  try {
    if (pathExistsSync(messagesPath)) {
      messages = readJsonSync(messagesPath);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Could not read messages.json for ${lang}`, e);
  }

  return { emojisInfo, messages };
}

function sortEmojis(emojis: EmojiRecord[]): EmojiRecord[] {
  return [...emojis].sort((a, b) => {
    const orderA = a.order ?? 0;
    const orderB = b.order ?? 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    const hexA = a.hexcode || '';
    const hexB = b.hexcode || '';
    return hexA.localeCompare(hexB);
  });
}

function groupEmojis(emojis: EmojiRecord[]): Record<string, CleanEmoji[]> {
  const initial: Record<string, CleanEmoji[]> = {
    [keys.GROUP_NAME_CUSTOM]: [],
  };

  return emojis.reduce((acc, emoji) => {
    const groupNameKey = resolveGroupName(emoji);
    const normalizedKey = normalizeGroupName(groupNameKey);

    // Map external group key to internal category key
    let category = groupConversion[normalizedKey];

    // Fallback logic
    if (!category) {
      category =
        groupConversion[normalizedKey.replace(/-/g, '_')] || normalizedKey;
    }

    // Validate category existence
    if (
      !category ||
      (category !== keys.GROUP_NAME_CUSTOM &&
        !Object.values(keys).includes(category as any))
    ) {
      // Skip if category is null (explicitly ignored) or unknown
      return acc;
    }

    acc[category] = acc[category] || [];
    acc[category].push(cleanEmoji(emoji));
    return acc;
  }, initial);
}

function buildLocalizedCategories(
  lang: string,
  messages: { groups: { key: string; message: string }[] } | null,
): LocalizedCategories {
  // 1. Populate from emojibase messages.json
  const categories: LocalizedCategories =
    messages?.groups?.reduce((acc, group) => {
      const internalCategory = groupConversion[group.key];
      if (internalCategory) {
        acc[internalCategory] = {
          category: internalCategory,
          name: group.message,
        };
      }
      return acc;
    }, {} as LocalizedCategories) ?? {};

  // 2. Inject internal app-specific category names (Frequently Used, Recent, Custom)
  const internalNames =
    internalCategoryNames[lang.toLowerCase()] || internalCategoryNames.en;

  if (internalNames) {
    Object.assign(categories, {
      [keys.GROUP_NAME_SUGGESTED]: {
        category: keys.GROUP_NAME_SUGGESTED,
        name: internalNames.suggested,
      },
      [keys.GROUP_NAME_CUSTOM]: {
        category: keys.GROUP_NAME_CUSTOM,
        name: internalNames.custom,
      },
      // Special key for "Recently Used" distinct from "Frequently Used"
      suggested_recent: {
        category: keys.GROUP_NAME_SUGGESTED,
        name: internalNames.recent,
      },
      // "What's your mood?" preview caption
      preview_mood: {
        category: 'preview_mood',
        name: internalNames.mood,
      },
    });
  }

  return categories;
}

function writeEmojiFiles(lang: string, data: OutputData) {
  // Write localized file: src/data
  const fileContent = `
import { EmojiData } from '../types/exposedTypes';
const data = ${JSON.stringify(data)} as unknown as EmojiData;
export default data;`;

  writeFileSync(`./src/data/emojis-${lang}.ts`, fileContent.trim(), 'utf8');
  writeJSONSync(`./src/data/emojis-${lang}.json`, data, 'utf8');

  // If English, write the default file for backward compatibility or main entry
  if (lang === 'en') {
    writeJSONSync('./src/data/emojis.json', data, 'utf8');
    writeFileSync(
      './src/data/emojis.ts',
      `export default ${JSON.stringify(data)}`,
      'utf8',
    );
  }
}

// --- Main Processing Function ---

function processLanguage(lang: string) {
  // eslint-disable-next-line no-console
  console.log(`Processing language: ${lang}`);

  // 1. Read data
  const { emojisInfo, messages } = readEmojiData(lang);

  // 2. Sort
  const sortedEmojis = sortEmojis(emojisInfo);

  // 3. Group and Clean
  const groupedEmojis = groupEmojis(sortedEmojis);

  // 4. Build Category Map
  const categories = buildLocalizedCategories(lang, messages);

  // Filter emojis that don't have images in emoji-datasource
  const filteredEmojis = Object.keys(groupedEmojis).reduce(
    (acc, category) => {
      const emojis = groupedEmojis[category];
      const protectedCategories = [
        keys.GROUP_NAME_CUSTOM,
        keys.GROUP_NAME_SUGGESTED,
      ];

      if (protectedCategories.includes(category as any)) {
        acc[category] = emojis;
        return acc;
      }

      acc[category] = emojis.filter((emoji) => {
        const unified = emoji.u.toUpperCase();

        if (emojiDataSourceUnifieds.has(unified)) {
          return true;
        }

        const unifiedVar = `${unified}-FE0F`;
        if (emojiDataSourceUnifieds.has(unifiedVar)) {
          emoji.u = unifiedVar.toLowerCase();
          return true;
        }

        return false;
      });
      return acc;
    },
    {} as Record<string, CleanEmoji[]>,
  );

  // 5. Construct Final Output
  const outputData: OutputData = {
    categories,
    emojis: filteredEmojis,
  };

  // 6. Write to Disk
  writeEmojiFiles(lang, outputData);
}

// --- Execution ---

const languages = getAvailableLanguages();
languages.forEach(processLanguage);
