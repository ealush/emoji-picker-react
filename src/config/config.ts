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

export function mergeConfig(
  userConfig: PickerConfig = {}
): PickerConfigInternal {
  const base = basePickerConfig();

  const previewConfig = Object.assign(
    base.previewConfig,
    userConfig.previewConfig ?? {}
  );
  const config = Object.assign(base, userConfig);

  const categories = mergeCategoriesConfig(userConfig.categories, {
    suggestionMode: config.suggestedEmojisMode
  });

  return {
    ...config,
    categories,
    previewConfig
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
    skinTonesDisabled: false,
    theme: Theme.LIGHT,
    suggestedEmojisMode: SuggestionMode.FREQUENT,
    lazyLoadEmojis: false,
    previewConfig: {
      ...basePreviewConfig
    }
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
  theme: Theme;
  suggestedEmojisMode: SuggestionMode;
  lazyLoadEmojis: boolean;
  previewConfig: PreviewConfig;
};

export type PreviewConfig = {
  defaultEmoji: string;
  defaultCaption: string;
  showPreview: boolean;
};

const basePreviewConfig: PreviewConfig = {
  defaultEmoji: '1f60a',
  defaultCaption: "What's your mood?",
  showPreview: true
};

type ConfigExternal = {
  previewConfig: Partial<PreviewConfig>;
} & Omit<PickerConfigInternal, 'previewConfig'>;

export type PickerConfig = Partial<ConfigExternal>;
