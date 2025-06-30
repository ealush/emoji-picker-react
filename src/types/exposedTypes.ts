import type * as EmojiPickerReact from './public';

export type EmojiClickData = {
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;
  names: string[];
  imageUrl: string;
  getImageUrl: (emojiStyle?: EmojiPickerReact.EmojiStyle) => string;
  isCustom: boolean;
};

/** @deprecated consider use plain string values or use `EmojiPickerReact.SuggestionMode` as type */
export enum SuggestionMode {
  RECENT = 'recent',
  FREQUENT = 'frequent'
}

/** @deprecated consider use plain string values or use `EmojiPickerReact.EmojiStyle` as type */
export enum EmojiStyle {
  NATIVE = 'native',
  APPLE = 'apple',
  TWITTER = 'twitter',
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

/** @deprecated consider use plain string values or use `EmojiPickerReact.Theme` as type */
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

/** @deprecated consider use plain string values or use `EmojiPickerReact.Category` as type */
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

/** @deprecated consider use plain string values or use `EmojiPickerReact.SkinTonePickerLocation` as type */
export enum SkinTonePickerLocation {
  SEARCH = 'SEARCH',
  PREVIEW = 'PREVIEW'
}
