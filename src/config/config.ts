import * as React from 'react';

import { DEFAULT_REACTIONS } from '../components/Reactions/DEFAULT_REACTIONS';
import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { emojiUrlByUnified } from '../dataUtils/emojiUtils';
import {
  EmojiClickData,
  EmojiData,
  EmojiStyle,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  Theme,
} from '../types/exposedTypes';

import {
  CategoriesConfig,
  baseCategoriesConfig,
  mergeCategoriesConfig,
} from './categoryConfig';
import { CustomEmoji } from './customEmojiConfig';

const KNOWN_FAILING_EMOJIS = ['2640-fe0f', '2642-fe0f', '2695-fe0f'];

export const DEFAULT_SEARCH_PLACEHOLDER = 'Search';
export const DEFAULT_SEARCH_CLEAR_BUTTON_LABEL = 'Clear';
export const SEARCH_RESULTS_NO_RESULTS_FOUND = 'No results found';
export const SEARCH_RESULTS_SUFFIX =
  ' found. Use up and down arrow keys to navigate.';
export const SEARCH_RESULTS_ONE_RESULT_FOUND =
  '1 result' + SEARCH_RESULTS_SUFFIX;
export const SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND =
  '%n results' + SEARCH_RESULTS_SUFFIX;

export function mergeConfig(
  userConfig: PickerConfig = {},
): PickerConfigInternal {
  const base = basePickerConfig();

  // Get localized mood from emojiData, fallback to base default
  // Get localized mood from emojiData, fallback to base default
  const localizedMood = (
    userConfig.emojiData?.categories as Record<
      string,
      { name: string } | undefined
    >
  )?.preview_mood?.name;

  const previewConfig = {
    ...base.previewConfig,
    // Localized mood is default, but user can override
    ...(localizedMood && !userConfig.previewConfig?.defaultCaption
      ? { defaultCaption: localizedMood }
      : {}),
    ...(userConfig.previewConfig ?? {}),
  };

  const config = Object.assign(base, userConfig);

  const categories = mergeCategoriesConfig(
    userConfig.categories,
    {
      suggestionMode: config.suggestedEmojisMode,
    },
    userConfig.emojiData,
  );

  config.hiddenEmojis.forEach((emoji) => {
    config.unicodeToHide.add(emoji);
  });

  const skinTonePickerLocation = config.searchDisabled
    ? SkinTonePickerLocation.PREVIEW
    : config.skinTonePickerLocation;

  return {
    ...config,
    categories,
    previewConfig,
    skinTonePickerLocation,
  };
}

export function basePickerConfig(): PickerConfigInternal {
  return {
    autoFocusSearch: true,
    categories: baseCategoriesConfig(),
    className: '',
    customEmojis: [],
    defaultSkinTone: SkinTones.NEUTRAL,
    emojiStyle: EmojiStyle.APPLE,
    emojiVersion: null,
    getEmojiUrl: emojiUrlByUnified,
    height: 450,
    lazyLoadEmojis: false,
    previewConfig: {
      ...basePreviewConfig,
    },
    searchDisabled: false,
    searchPlaceHolder: DEFAULT_SEARCH_PLACEHOLDER,
    searchPlaceholder: DEFAULT_SEARCH_PLACEHOLDER,
    searchClearButtonLabel: DEFAULT_SEARCH_CLEAR_BUTTON_LABEL,
    skinTonePickerLocation: SkinTonePickerLocation.SEARCH,
    skinTonesDisabled: false,
    style: {},
    suggestedEmojisMode: SuggestionMode.FREQUENT,
    theme: Theme.LIGHT,
    unicodeToHide: new Set<string>(KNOWN_FAILING_EMOJIS),
    width: 350,
    reactionsDefaultOpen: false,
    reactions: DEFAULT_REACTIONS,
    open: true,
    allowExpandReactions: true,
    hiddenEmojis: [],
    emojiData: undefined,
  };
}

export type PickerConfigInternal = {
  emojiVersion: string | null;
  searchPlaceHolder: string;
  searchPlaceholder: string;
  searchClearButtonLabel: string;
  defaultSkinTone: SkinTones;
  skinTonesDisabled: boolean;
  autoFocusSearch: boolean;
  emojiStyle: EmojiStyle;
  categories: CategoriesConfig;
  theme: Theme;
  suggestedEmojisMode: SuggestionMode;
  lazyLoadEmojis: boolean;
  previewConfig: PreviewConfig;
  className: string;
  height: PickerDimensions;
  width: PickerDimensions;
  style: React.CSSProperties;
  getEmojiUrl: GetEmojiUrl;
  searchDisabled: boolean;
  skinTonePickerLocation: SkinTonePickerLocation;
  unicodeToHide: Set<string>;
  customEmojis: CustomEmoji[];
  reactionsDefaultOpen: boolean;
  reactions: string[];
  open: boolean;
  allowExpandReactions: boolean;
  hiddenEmojis: string[];
  emojiData?: EmojiData;
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
  onEmojiClick: MouseDownEvent;
  onReactionClick: MouseDownEvent;
  onSkinToneChange: OnSkinToneChange;
} & Omit<PickerConfigInternal, 'previewConfig' | 'unicodeToHide'>;

export type PickerConfig = Partial<ConfigExternal>;

export type PickerDimensions = string | number;

export type MouseDownEvent = (
  emoji: EmojiClickData,
  event: MouseEvent,
  api?: OnEmojiClickApi,
) => void;
export type OnSkinToneChange = (emoji: SkinTones) => void;

type OnEmojiClickApi = {
  collapseToReactions: () => void;
};
