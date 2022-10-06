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
    suggestionMode: config.suggestedEmojisMode,
  });

  return {
    ...config,
    categories,
    previewConfig,
  };
}

export function basePickerConfig(): PickerConfigInternal {
  return {
    autoFocusSearch: true,
    categories: baseCategoriesConfig(),
    defaultSkinTone: SkinTones.NEUTRAL,
    emojiStyle: EmojiStyle.APPLE,
    emojiVersion: null,
    height: 450,
    lazyLoadEmojis: false,
    onEmojiClick: function defaultOnClickHandler(
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emoji: EmojiClickData,
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      event: MouseEvent
    ) {},
    previewConfig: {
      ...basePreviewConfig,
    },
    searchPlaceHolder: 'Search',
    skinTonesDisabled: false,
    suggestedEmojisMode: SuggestionMode.FREQUENT,
    theme: Theme.LIGHT,
    width: 350,
  };
}

export type PickerConfigInternal = {
  emojiVersion: string | null;
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
  height: number;
  width: number;
};

export type PreviewConfig = {
  defaultEmoji: string;
  defaultCaption: string;
  showPreview: boolean;
};

const basePreviewConfig: PreviewConfig = {
  defaultEmoji: '1f60a',
  defaultCaption: "What's your mood?",
  showPreview: true,
};

type ConfigExternal = {
  previewConfig: Partial<PreviewConfig>;
} & Omit<PickerConfigInternal, 'previewConfig'>;

export type PickerConfig = Partial<ConfigExternal>;
