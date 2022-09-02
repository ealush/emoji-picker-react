import { SkinTones } from '../data/skinToneVariations';
import { EmojiClickData } from '../types/exposedTypes';

import {
  CategoriesConfig,
  baseCategoriesConfig,
  mergeCategoriesConfig
} from './categoryConfig';

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

export function mergeConfig(userConfig: PickerConfig = {}) {
  const categories = mergeCategoriesConfig(userConfig.categories);
  return {
    ...basePickerConfig(),
    ...userConfig,
    categories
  };
}

export function basePickerConfig(): PickerConfigInternal {
  return {
    autoFocusSearch: true,
    categories: baseCategoriesConfig,
    defaultSkinTone: SkinTones.NEUTRAL,
    emojiStyle: EmojiStyle.APPLE,
    onEmojiClick: function defaultOnClickHandler(
      // @ts-ignore
      event: MouseEvent,
      // @ts-ignore
      emoji: EmojiClickData
    ) {},
    searchPlaceHolder: 'Search',
    showPreview: true,
    skinTonesDisabled: false,
    theme: Theme.LIGHT
  };
}

export type PickerConfigInternal = {
  searchPlaceHolder: string;
  defaultSkinTone: SkinTones;
  skinTonesDisabled: boolean;
  autoFocusSearch: boolean;
  emojiStyle: EmojiStyle;
  categories: CategoriesConfig;
  onEmojiClick: (event: MouseEvent, emoji: EmojiClickData) => void;
  showPreview: boolean;
  theme: Theme;
};

export type PickerConfig = Partial<PickerConfigInternal>;
