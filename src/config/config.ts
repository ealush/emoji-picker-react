import {
  EmojiClickData,
  EmojiStyle,
  SkinTones,
  SuggestionMode,
  Theme,
} from '../types/exposedTypes';

import {
  CategoriesConfig,
  baseCategoriesConfig,
  mergeCategoriesConfig,
} from './categoryConfig';

export function mergeConfig(userConfig: PickerConfig = {}) {
  const config = { ...basePickerConfig(), ...userConfig };

  const categories = mergeCategoriesConfig(userConfig.categories, {
    suggestionMode: config.suggestedEmojisMode,
  });

  return {
    ...config,
    categories,
  };
}

export function basePickerConfig(): PickerConfigInternal {
  return {
    autoFocusSearch: true,
    categories: baseCategoriesConfig(),
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
    suggestedEmojisMode: SuggestionMode.FREQUENT,
    lazyLoadEmojis: false,
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
  lazyLoadEmojis: boolean;
};

export type PickerConfig = Partial<PickerConfigInternal>;
