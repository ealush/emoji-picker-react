// --- Constants ---

export const EMOJI_BASE_DATA_PATH = 'node_modules/emojibase-data';

export const keys = {
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

// --- Types ---

export type GroupEntry =
  | string
  | {
      key?: string;
      name?: string;
      label?: string;
      index?: number;
      id?: number;
      order?: number;
    };

export type EmojiSkin = {
  hexcode?: string;
  hex?: string;
  unicode?: string;
  emoji?: string;
};

export type EmojiRecord = {
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

export type CleanEmoji = {
  n: string[];
  u: string;
  v?: string[];
  a?: string;
};

export type CategoryTranslation = {
  category: string;
  name: string;
};

export type LocalizedCategories = Record<string, CategoryTranslation>;

export type OutputData = {
  categories: LocalizedCategories;
  emojis: Record<string, CleanEmoji[]>;
};

// --- Mappings ---

/**
 * Mapping from Emojibase group keys to internal Category keys.
 */
export const groupConversion: Record<string, string | null> = {
  'smileys-emotion': keys.GROUP_NAME_PEOPLE,
  'people-body': keys.GROUP_NAME_PEOPLE,
  'animals-nature': keys.GROUP_NAME_NATURE,
  'food-drink': keys.GROUP_NAME_FOOD,
  'travel-places': keys.GROUP_NAME_TRAVEL,
  activities: keys.GROUP_NAME_ACTIVITIES,
  objects: keys.GROUP_NAME_OBJECTS,
  symbols: keys.GROUP_NAME_SYMBOLS,
  flags: keys.GROUP_NAME_FLAGS,
  component: null,
  // Backward compatibility keys
  [keys.GROUP_NAME_PEOPLE]: keys.GROUP_NAME_PEOPLE,
  smileys_emotion: keys.GROUP_NAME_PEOPLE,
  smileys_and_emotion: keys.GROUP_NAME_PEOPLE,
  custom: keys.GROUP_NAME_CUSTOM,
  people_body: keys.GROUP_NAME_PEOPLE,
  animals_nature: keys.GROUP_NAME_NATURE,
  food_drink: keys.GROUP_NAME_FOOD,
  travel_places: keys.GROUP_NAME_TRAVEL,
  components: null,
  skin_tones: null
};

// --- Internal Categories ---

export const internalCategoryNames: Record<
  string,
  { suggested: string; recent: string; custom: string; mood: string }
> = {
  // Bengali
  bn: {
    suggested: 'প্রায়শই ব্যবহৃত',
    recent: 'সম্প্রতি ব্যবহৃত',
    custom: 'কাস্টম ইমোজি',
    mood: 'আপনার মেজাজ কেমন?'
  },
  // Danish
  da: {
    suggested: 'Hyppigt anvendte',
    recent: 'Senest anvendte',
    custom: 'Brugerdefinerede emojis',
    mood: 'Hvad er dit humør?'
  },
  // German
  de: {
    suggested: 'Häufig verwendet',
    recent: 'Zuletzt verwendet',
    custom: 'Benutzerdefinierte Emojis',
    mood: 'Wie ist deine Stimmung?'
  },
  // English
  en: {
    suggested: 'Frequently Used',
    recent: 'Recently Used',
    custom: 'Custom Emojis',
    mood: "What's your mood?"
  },
  'en-gb': {
    suggested: 'Frequently Used',
    recent: 'Recently Used',
    custom: 'Custom Emojis',
    mood: "What's your mood?"
  },
  // Spanish
  es: {
    suggested: 'Frecuentemente usados',
    recent: 'Usados recientemente',
    custom: 'Emojis personalizados',
    mood: '¿Cuál es tu estado de ánimo?'
  },
  'es-mx': {
    suggested: 'Frecuentemente usados',
    recent: 'Usados recientemente',
    custom: 'Emojis personalizados',
    mood: '¿Cuál es tu estado de ánimo?'
  },
  // Estonian
  et: {
    suggested: 'Sageli kasutatud',
    recent: 'Hiljuti kasutatud',
    custom: 'Kohandatud emojid',
    mood: 'Mis tuju sul on?'
  },
  // Finnish
  fi: {
    suggested: 'Usein käytetyt',
    recent: 'Viimeksi käytetyt',
    custom: 'Omat emojit',
    mood: 'Mikä on fiiliksesi?'
  },
  // French
  fr: {
    suggested: 'Fréquemment utilisés',
    recent: 'Récemment utilisés',
    custom: 'Émojis personnalisés',
    mood: 'Quelle est votre humeur ?'
  },
  // Hindi
  hi: {
    suggested: 'बार-बार उपयोग किया गया',
    recent: 'हाल ही में उपयोग किया गया',
    custom: 'कस्टम इमोजी',
    mood: 'आपका मूड क्या है?'
  },
  // Hungarian
  hu: {
    suggested: 'Gyakran használt',
    recent: 'Legutóbb használt',
    custom: 'Egyéni emojik',
    mood: 'Mi a hangulatod?'
  },
  // Italian
  it: {
    suggested: 'Usati frequentemente',
    recent: 'Usati di recente',
    custom: 'Emoji personalizzate',
    mood: 'Qual è il tuo umore?'
  },
  // Japanese
  ja: {
    suggested: 'よく使う',
    recent: '最近使用した',
    custom: 'カスタム絵文字',
    mood: '気分はどう？'
  },
  // Korean
  ko: {
    suggested: '자주 사용하는',
    recent: '최근 사용한',
    custom: '맞춤 이모티콘',
    mood: '기분이 어때?'
  },
  // Lithuanian
  lt: {
    suggested: 'Dažnai naudojami',
    recent: 'Paskutinį kartą naudoti',
    custom: 'Pasirinktiniai emodžiai',
    mood: 'Kokia tavo nuotaika?'
  },
  // Malay
  ms: {
    suggested: 'Kerap Digunakan',
    recent: 'Baru Digunakan',
    custom: 'Emoji Tersuai',
    mood: 'Apakah perasaan anda?'
  },
  // Norwegian Bokmål
  nb: {
    suggested: 'Ofte brukt',
    recent: 'Nylig brukt',
    custom: 'Egendefinerte emojier',
    mood: 'Hva er humøret ditt?'
  },
  // Dutch
  nl: {
    suggested: 'Vaak gebruikt',
    recent: 'Recentelijk gebruikt',
    custom: "Aangepaste emoji's",
    mood: 'Wat is je stemming?'
  },
  // Polish
  pl: {
    suggested: 'Często używane',
    recent: 'Ostatnio używane',
    custom: 'Niestandardowe emotikony',
    mood: 'Jaki masz nastrój?'
  },
  // Portuguese
  pt: {
    suggested: 'Mais usados',
    recent: 'Usados recentemente',
    custom: 'Emojis personalizados',
    mood: 'Qual é o seu humor?'
  },
  // Russian
  ru: {
    suggested: 'Часто используемые',
    recent: 'Недавно использованные',
    custom: 'Пользовательские эмодзи',
    mood: 'Какое у вас настроение?'
  },
  // Swedish
  sv: {
    suggested: 'Ofta använda',
    recent: 'Nyligen använda',
    custom: 'Anpassade emojier',
    mood: 'Vad är ditt humör?'
  },
  // Thai
  th: {
    suggested: 'ใช้บ่อย',
    recent: 'ใช้ล่าสุด',
    custom: 'อีโมจิที่กำหนดเอง',
    mood: 'อารมณ์ของคุณเป็นอย่างไร?'
  },
  // Ukrainian
  uk: {
    suggested: 'Часто використовувані',
    recent: 'Нещодавно використані',
    custom: 'Власні емодзі',
    mood: 'Який у вас настрій?'
  },
  // Chinese (Simplified)
  zh: {
    suggested: '常用',
    recent: '最近使用',
    custom: '自定义表情',
    mood: '你的心情如何？'
  },
  // Chinese (Traditional)
  'zh-hant': {
    suggested: '常用',
    recent: '最近使用',
    custom: '自訂表情符號',
    mood: '你的心情如何？'
  }
};
