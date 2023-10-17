import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import {
  addCustomEmojis,
  emojiUrlByUnified
} from '../dataUtils/emojiSelectors';
import {
  EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  Theme
} from '../types/exposedTypes';

import {
  CategoriesConfig,
  baseCategoriesConfig,
  mergeCategoriesConfig
} from './categoryConfig';
import { CustomEmoji } from './customEmojiConfig';

const KNOWN_FAILING_EMOJIS = ['2640-fe0f', '2642-fe0f', '2695-fe0f'];

export const DEFAULT_SEARCH_PLACEHOLDER = 'Search';

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

  addCustomEmojis(config.customEmojis ?? []);

  const skinTonePickerLocation = config.searchDisabled
    ? SkinTonePickerLocation.PREVIEW
    : config.skinTonePickerLocation;

  return {
    ...config,
    categories,
    previewConfig,
    skinTonePickerLocation
  };
}

export function basePickerConfig(): PickerConfigInternal {
  return {
    autoFocusSearch: true,
    categories: baseCategoriesConfig(),
    customEmojis: [],
    defaultSkinTone: SkinTones.NEUTRAL,
    emojiStyle: EmojiStyle.APPLE,
    emojiVersion: null,
    getEmojiUrl: emojiUrlByUnified,
    height: 450,
    lazyLoadEmojis: false,
    previewConfig: {
      ...basePreviewConfig
    },
    searchDisabled: false,
    searchPlaceHolder: DEFAULT_SEARCH_PLACEHOLDER,
    searchPlaceholder: DEFAULT_SEARCH_PLACEHOLDER,
    skinTonePickerLocation: SkinTonePickerLocation.SEARCH,
    skinTonesDisabled: false,
    suggestedEmojisMode: SuggestionMode.FREQUENT,
    theme: Theme.LIGHT,
    unicodeToHide: new Set<string>(KNOWN_FAILING_EMOJIS),
    width: 350
  };
}

export type PickerConfigInternal = {
  emojiVersion: string | null;
  searchPlaceHolder: string;
  searchPlaceholder: string;
  defaultSkinTone: SkinTones;
  skinTonesDisabled: boolean;
  autoFocusSearch: boolean;
  emojiStyle: EmojiStyle;
  categories: CategoriesConfig;
  theme: Theme;
  suggestedEmojisMode: SuggestionMode;
  lazyLoadEmojis: boolean;
  previewConfig: PreviewConfig;
  height: PickerDimensions;
  width: PickerDimensions;
  getEmojiUrl: GetEmojiUrl;
  searchDisabled: boolean;
  skinTonePickerLocation: SkinTonePickerLocation;
  unicodeToHide: Set<string>;
  customEmojis: CustomEmoji[];
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
  onEmojiClick: (emoji: EmojiClickData, event: MouseEvent) => void;
} & Omit<PickerConfigInternal, 'previewConfig' | 'unicodeToHide'>;

export type PickerConfig = Partial<ConfigExternal>;

export type PickerDimensions = string | number;
