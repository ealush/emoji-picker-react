import * as React from 'react';

export type EmojiClickData = {
  activeSkinTone: SkinTones;
  unified: string;
  unifiedWithoutSkinTone: string;
  emoji: string;
  names: string[];
  imageUrl: string;
  getImageUrl: (emojiStyle?: EmojiStyleValue) => string;
  isCustom: boolean;
};

export type CategoryConfig = {
  category: Categories;
  name: string;
  icon?: React.ReactNode;
  /**
   * Selects a `CustomEmoji` group for `Categories.CUSTOM` entries. Each
   * grouped entry renders its own section and nav tab; ungrouped entries
   * share the classic customs bucket.
   */
  group?: string;
};

export type CategoryIcons = Partial<Record<Categories, React.ReactNode>>;

/**
 * Every user-facing string the picker renders or announces. All keys are
 * optional on the `labels` prop; anything omitted comes from the
 * dataset's translations (`emojiData.labels`), then the English default.
 * Category names come from `categories` / localized `emojiData`, and the
 * preview caption from `previewConfig.defaultCaption`.
 */
export type PickerLabels = {
  searchPlaceholder: string;
  /** Accessible name of the search input. */
  searchLabel: string;
  searchClear: string;
  /** Live-region announcement and visible empty state. */
  searchResultsNone: string;
  searchResultsOne: string;
  /** `%n` is replaced with the result count. */
  searchResultsMany: string;
  categoryNavigation: string;
  reactions: string;
  expandReactions: string;
  /** Shown by the Loading part while the dataset loads. */
  loading: string;
  loadingError: string;
  retryLoading: string;
  skinToneNeutral: string;
  skinToneLight: string;
  skinToneMediumLight: string;
  skinToneMedium: string;
  skinToneMediumDark: string;
  skinToneDark: string;
};

export type EmojiData = {
  categories: Partial<Record<Categories, CategoryConfig>>;
  emojis: Record<string, DataEmoji[]>;
  /**
   * Translated UI strings. Every bundled locale dataset carries them;
   * the picker applies them beneath the `labels` prop.
   */
  labels?: Partial<PickerLabels>;
};

export interface DataEmoji {
  n: string[];
  u: string;
  v?: string[];
  a: string;
}

export enum SuggestionMode {
  RECENT = 'recent',
  FREQUENT = 'frequent',
}

export type SuggestionModeValue = SuggestionMode | 'recent' | 'frequent';

export enum EmojiStyle {
  NATIVE = 'native',
  APPLE = 'apple',
  TWITTER = 'twitter',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export type EmojiStyleValue =
  | EmojiStyle
  | 'native'
  | 'apple'
  | 'twitter'
  | 'google'
  | 'facebook';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
  AUTO = 'auto',
}

export type ThemeValue = Theme | 'dark' | 'light' | 'auto';

export enum SkinTones {
  NEUTRAL = 'neutral',
  LIGHT = '1f3fb',
  MEDIUM_LIGHT = '1f3fc',
  MEDIUM = '1f3fd',
  MEDIUM_DARK = '1f3fe',
  DARK = '1f3ff',
}

/** A skin tone as the enum or its literal value (`'neutral'`, `'1f3fb'`, …). */
export type SkinTonesValue =
  | SkinTones
  | 'neutral'
  | '1f3fb'
  | '1f3fc'
  | '1f3fd'
  | '1f3fe'
  | '1f3ff';

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
  FLAGS = 'flags',
}

export enum SkinTonePickerLocation {
  SEARCH = 'SEARCH',
  PREVIEW = 'PREVIEW',
  /**
   * No built-in placement: render the `SkinTone` primitive wherever you
   * want it, or drive the tone through `skinTone` / `useSkinTone()`.
   */
  NONE = 'NONE',
}
