import {
  EmojiClickData,
  EmojiStyle,
  SkinTones,
  SuggestionMode,
  Theme
} from '../types/exposedTypes';

import {
  CategoriesConfig,
  baseCategoriesConfig,
  mergeCategoriesConfig
} from './categoryConfig';

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
      emoji: EmojiClickData,
      // @ts-ignore
      event: MouseEvent
    ) {},
    searchPlaceHolder: 'Search',
    showPreview: true,
    skinTonesDisabled: false,
    theme: Theme.LIGHT,
    suggestedEmojisMode: SuggestionMode.FREQUENT
  };
}

export type PickerConfigInternal = {
  searchPlaceHolder: string;
  defaultSkinTone: SkinTones;
  skinTonesDisabled: boolean;
  autoFocusSearch: boolean;
  emojiStyle: EmojiStyle;
  categories: CategoriesConfig;
  onEmojiClick: (emoji: EmojiClickData, event: MouseEvent) => void;
  showPreview: boolean;
  theme: Theme;
  suggestedEmojisMode: SuggestionMode;
};

export type PickerConfig = Partial<PickerConfigInternal>;
