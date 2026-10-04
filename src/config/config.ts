import * as React from 'react';

import { DEFAULT_REACTIONS } from '../components/Reactions/DEFAULT_REACTIONS';
import { GetEmojiUrl } from '../components/emoji/BaseEmojiProps';
import { emojiUrlByUnified } from '../dataUtils/emojiUtils';
import type { EmojiDataInput } from '../hooks/useResolvedEmojiData';
import {
  CategoryIcons,
  EmojiClickData,
  EmojiData,
  EmojiStyle,
  EmojiStyleValue,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  SuggestionModeValue,
  Theme,
  ThemeValue,
} from '../types/exposedTypes';

import {
  CategoriesConfig,
  UserCategoryConfig,
  baseCategoriesConfig,
  mergeCategoriesConfig,
} from './categoryConfig';
import { CustomEmoji } from './customEmojiConfig';

const KNOWN_FAILING_EMOJIS = ['2640-fe0f', '2642-fe0f', '2695-fe0f'];

export const DEFAULT_SEARCH_PLACEHOLDER = 'Search';
export const DEFAULT_PICKER_WIDTH = 350;
export const DEFAULT_PICKER_HEIGHT = 450;
export const DEFAULT_SEARCH_INPUT_LABEL = 'Type to search for an emoji';
export const DEFAULT_SEARCH_CLEAR_BUTTON_LABEL = 'Clear';
export const SEARCH_RESULTS_NO_RESULTS_FOUND = 'No results found';
export const SEARCH_RESULTS_SUFFIX =
  ' found. Use up and down arrow keys to navigate.';
export const SEARCH_RESULTS_ONE_RESULT_FOUND =
  '1 result' + SEARCH_RESULTS_SUFFIX;
export const SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND =
  '%n results' + SEARCH_RESULTS_SUFFIX;

/**
 * Every user-facing string the picker renders or announces. All keys are
 * optional on the `labels` prop; anything omitted keeps its English
 * default. Category names come from `categories` / localized `emojiData`,
 * and the preview caption from `previewConfig.defaultCaption`.
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

// English defaults, identical to the v4 strings so existing queries and
// snapshots keep matching.
export const DEFAULT_LABELS: PickerLabels = {
  searchPlaceholder: DEFAULT_SEARCH_PLACEHOLDER,
  searchLabel: DEFAULT_SEARCH_INPUT_LABEL,
  searchClear: DEFAULT_SEARCH_CLEAR_BUTTON_LABEL,
  searchResultsNone: SEARCH_RESULTS_NO_RESULTS_FOUND,
  searchResultsOne: SEARCH_RESULTS_ONE_RESULT_FOUND,
  searchResultsMany: SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND,
  categoryNavigation: 'Category navigation',
  reactions: 'Reactions',
  expandReactions: 'Show all Emojis',
  loading: 'Loading…',
  loadingError: 'Could not load emojis.',
  retryLoading: 'Try again',
  skinToneNeutral: 'Skin tone NEUTRAL',
  skinToneLight: 'Skin tone LIGHT',
  skinToneMediumLight: 'Skin tone MEDIUM_LIGHT',
  skinToneMedium: 'Skin tone MEDIUM',
  skinToneMediumDark: 'Skin tone MEDIUM_DARK',
  skinToneDark: 'Skin tone DARK',
};

type ResolvedUserConfig = Omit<PickerConfig, 'emojiData'> & {
  emojiData?: EmojiData;
};

function withResolvedEmojiData(config: PickerConfig): ResolvedUserConfig {
  return (
    typeof config.emojiData === 'function'
      ? { ...config, emojiData: undefined }
      : config
  ) as ResolvedUserConfig;
}

// Localized mood caption from emojiData is the default; an explicit
// previewConfig.defaultCaption still wins.
function mergePreviewConfig(
  base: PreviewConfig,
  userConfig: ResolvedUserConfig,
): PreviewConfig {
  const localizedMood = (
    userConfig.emojiData?.categories as Record<
      string,
      { name: string } | undefined
    >
  )?.preview_mood?.name;

  return {
    ...base,
    ...(localizedMood && !userConfig.previewConfig?.defaultCaption
      ? { defaultCaption: localizedMood }
      : {}),
    ...(userConfig.previewConfig ?? {}),
  };
}

/**
 * The default style is native, but a caller-supplied image URL resolver is
 * an explicit request for images: without an explicit `emojiStyle` it keeps
 * v4's image default (Apple), so the resolver is actually used.
 */
export function resolveEmojiStyle(
  emojiStyle: EmojiStyleValue | undefined,
  customImageSource: unknown,
): EmojiStyleValue {
  if (emojiStyle !== undefined) {
    return emojiStyle;
  }
  return customImageSource ? EmojiStyle.APPLE : EmojiStyle.NATIVE;
}

export function mergeConfig(
  rawUserConfig: PickerConfig = {},
): PickerConfigInternal {
  const base = basePickerConfig();
  // Root resolves loaders before configuration is merged; a loader that
  // reaches this point (direct internal use) is treated as "not loaded".
  const userConfig = withResolvedEmojiData(rawUserConfig);
  const previewConfig = mergePreviewConfig(base.previewConfig, userConfig);

  const config = Object.assign(base, userConfig) as PickerConfigInternal;
  config.emojiStyle = resolveEmojiStyle(
    userConfig.emojiStyle,
    userConfig.getEmojiUrl,
  );

  const categories = mergeCategoriesConfig(
    userConfig.categories,
    {
      suggestionMode: config.suggestedEmojisMode,
    },
    userConfig.emojiData,
    userConfig.customEmojis,
  );

  config.hiddenEmojis.forEach((emoji) => {
    config.unicodeToHide.add(emoji);
  });

  // Without Search, a search-located control moves to the preview; an
  // explicit NONE (or PREVIEW) placement is kept as-is.
  const skinTonePickerLocation =
    config.searchDisabled &&
    config.skinTonePickerLocation === SkinTonePickerLocation.SEARCH
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
    emojiStyle: EmojiStyle.NATIVE,
    emojiVersion: null,
    getEmojiUrl: emojiUrlByUnified,
    height: DEFAULT_PICKER_HEIGHT,
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
    width: DEFAULT_PICKER_WIDTH,
    reactionsDefaultOpen: false,
    reactions: DEFAULT_REACTIONS,
    open: true,
    allowExpandReactions: true,
    hiddenEmojis: [],
    emojiData: undefined,
    categoryIcons: {},
    nonce: undefined,
    searchValue: undefined,
    defaultSearchValue: undefined,
    onSearchChange: undefined,
    searchLabel: undefined,
    suggestedEmojis: undefined,
    onReactionsModeChange: undefined,
    labels: undefined,
    skinTone: undefined,
    cssLayer: undefined,
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
  emojiStyle: EmojiStyleValue;
  categories: CategoriesConfig;
  theme: ThemeValue;
  suggestedEmojisMode: SuggestionModeValue;
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
  categoryIcons: CategoryIcons;
  nonce?: string;
  /**
   * Controlled search value (raw user text). When present, it is the
   * accepted visible source of truth; user edits emit `onSearchChange`
   * proposals instead of committing locally. See docs/v5/STATE.md.
   */
  searchValue?: string;
  /** Uncontrolled initial search value, read once per mounted lifetime. */
  defaultSearchValue?: string;
  /** Emitted synchronously with each committed (uncontrolled) or proposed (controlled) user edit. */
  onSearchChange?: (value: string) => void;
  /** Accessible label for the search input. Defaults to English. */
  searchLabel?: string;
  /**
   * Caller-defined Suggested category contents/order (unified or custom
   * IDs). While present, `suggestedEmojisMode` is ignored for contents.
   */
  suggestedEmojis?: string[];
  /** Observes compact-reactions vs full-picker transitions. */
  onReactionsModeChange?: (reactionsOpen: boolean) => void;
  /**
   * Localized user-facing strings. Takes precedence over the individual
   * `searchPlaceholder` / `searchLabel` / `searchClearButtonLabel` props.
   */
  labels?: Partial<PickerLabels>;
  /**
   * Controlled active skin tone. Pair with `onSkinToneChange`; while
   * present, `defaultSkinTone` is ignored.
   */
  skinTone?: SkinTones;
  /**
   * Emit the picker's CSS inside this cascade layer (e.g. "epr"), for
   * layered CSS frameworks such as Tailwind v4 whose utilities cannot
   * beat unlayered CSS. Declare the layer first in your CSS:
   * `@layer epr, theme, base, components, utilities;`. Default: unlayered.
   */
  cssLayer?: string;
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
  /**
   * User-supplied allowlist/order/merge input. Bare `Categories` members
   * are accepted alongside full configs (as in v4 usage and this repo's
   * own tests); the merged internal representation stays `CategoriesConfig`.
   */
  categories: UserCategoryConfig;
  /**
   * Dataset: an object (synchronous, SSR-safe), or a loader such as
   * `() => import('emoji-picker-react/data/emojis-fr')` to code-split it.
   * Omitted: the bundled English dataset.
   */
  emojiData: EmojiDataInput;
} & Omit<
  PickerConfigInternal,
  'previewConfig' | 'unicodeToHide' | 'categories' | 'emojiData'
>;

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
