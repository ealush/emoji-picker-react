export type EmojiClickData = {
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;
  names: string[];
  imageUrl: string;
  getImageUrl: (emojiStyle?: EmojiStyle) => string;
  isCustom: boolean;
};

export type CategoryConfig = {
  category: Categories;
  name: string;
};

export type EmojiData = {
  categories: Partial<Record<Categories, CategoryConfig>>;
  emojis: Record<string, DataEmoji[]>;
};

export interface DataEmoji {
  n: string[];
  u: string;
  v?: string[];
  a: string;
}

export enum SuggestionMode {
  RECENT = 'recent',
  FREQUENT = 'frequent'
}

export enum EmojiStyle {
  NATIVE = 'native',
  APPLE = 'apple',
  TWITTER = 'twitter',
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  AUTO = 'auto'
}

export enum SkinTones {
  NEUTRAL = 'neutral',
  LIGHT = '1f3fb',
  MEDIUM_LIGHT = '1f3fc',
  MEDIUM = '1f3fd',
  MEDIUM_DARK = '1f3fe',
  DARK = '1f3ff'
}

export enum Categories {
  SUGGESTED = 'suggested',
  CUSTOM = 'custom',
  SMILEYS_PEOPLE = 'smileys_people',
  ANIMALS_NATURE = 'animals_nature',
  FOOD_DRINK = 'food_drink',
  TRAVEL_PLACES = 'travel_places',
  ACTIVITIES = 'activities',
  OBJECTS = 'objects',
  SYMBOLS = 'symbols',
  FLAGS = 'flags'
}

export enum SkinTonePickerLocation {
  SEARCH = 'SEARCH',
  PREVIEW = 'PREVIEW'
}
