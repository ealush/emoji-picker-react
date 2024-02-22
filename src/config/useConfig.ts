import * as React from 'react';

import { usePickerConfig } from '../components/context/PickerConfigContext';
import {
  EmojiClickData,
  EmojiStyle,
  SkinTonePickerLocation,
  SkinTones,
  SuggestionMode,
  Theme
} from '../types/exposedTypes';

import { CategoriesConfig } from './categoryConfig';
import {
  DEFAULT_SEARCH_PLACEHOLDER,
  SEARCH_RESULTS_NO_RESULTS_FOUND,
  SEARCH_RESULTS_ONE_RESULT_FOUND,
  SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND,
  PickerDimensions,
  PreviewConfig
} from './config';
import { CustomEmoji } from './customEmojiConfig';
import { useMutableConfig } from './mutableConfig';

export enum MOUSE_EVENT_SOURCE {
  REACTIONS = 'reactions',
  PICKER = 'picker'
}

export function useSearchPlaceHolderConfig(): string {
  const { searchPlaceHolder, searchPlaceholder } = usePickerConfig();
  return (
    [searchPlaceHolder, searchPlaceholder].find(
      p => p !== DEFAULT_SEARCH_PLACEHOLDER
    ) ?? DEFAULT_SEARCH_PLACEHOLDER
  );
}

export function useDefaultSkinToneConfig(): SkinTones {
  const { defaultSkinTone } = usePickerConfig();
  return defaultSkinTone;
}

export function useAllowExpandReactions(): boolean {
  const { allowExpandReactions } = usePickerConfig();
  return allowExpandReactions;
}

export function useSkinTonesDisabledConfig(): boolean {
  const { skinTonesDisabled } = usePickerConfig();
  return skinTonesDisabled;
}

export function useEmojiStyleConfig(): EmojiStyle {
  const { emojiStyle } = usePickerConfig();
  return emojiStyle;
}

export function useAutoFocusSearchConfig(): boolean {
  const { autoFocusSearch } = usePickerConfig();
  return autoFocusSearch;
}

export function useCategoriesConfig(): CategoriesConfig {
  const { categories } = usePickerConfig();
  return categories;
}

export function useCustomEmojisConfig(): CustomEmoji[] {
  const { customEmojis } = usePickerConfig();
  return customEmojis;
}

export function useOpenConfig(): boolean {
  const { open } = usePickerConfig();
  return open;
}

export function useOnEmojiClickConfig(
  mouseEventSource: MOUSE_EVENT_SOURCE
): (emoji: EmojiClickData, event: MouseEvent) => void {
  const { current } = useMutableConfig();

  const handler =
    (mouseEventSource === MOUSE_EVENT_SOURCE.REACTIONS
      ? current.onReactionClick
      : current.onEmojiClick) ?? current.onEmojiClick;

  return handler || (() => {});
}

export function usePreviewConfig(): PreviewConfig {
  const { previewConfig } = usePickerConfig();
  return previewConfig;
}

export function useThemeConfig(): Theme {
  const { theme } = usePickerConfig();

  return theme;
}

export function useSuggestedEmojisModeConfig(): SuggestionMode {
  const { suggestedEmojisMode } = usePickerConfig();
  return suggestedEmojisMode;
}

export function useLazyLoadEmojisConfig(): boolean {
  const { lazyLoadEmojis } = usePickerConfig();
  return lazyLoadEmojis;
}

export function useClassNameConfig(): string {
  const { className } = usePickerConfig();
  return className;
}

export function useStyleConfig(): React.CSSProperties {
  const { height, width, style } = usePickerConfig();
  return { height: getDimension(height), width: getDimension(width), ...style };
}

export function useReactionsOpenConfig(): boolean {
  const { reactionsDefaultOpen } = usePickerConfig();
  return reactionsDefaultOpen;
}

export function useEmojiVersionConfig(): string | null {
  const { emojiVersion } = usePickerConfig();
  return emojiVersion;
}

export function useSearchDisabledConfig(): boolean {
  const { searchDisabled } = usePickerConfig();
  return searchDisabled;
}

export function useSkinTonePickerLocationConfig(): SkinTonePickerLocation {
  const { skinTonePickerLocation } = usePickerConfig();
  return skinTonePickerLocation;
}

export function useUnicodeToHide() {
  const { unicodeToHide } = usePickerConfig();
  return unicodeToHide;
}

export function useReactionsConfig(): string[] {
  const { reactions } = usePickerConfig();
  return reactions;
}

export function useGetEmojiUrlConfig(): (
  unified: string,
  style: EmojiStyle
) => string {
  const { getEmojiUrl } = usePickerConfig();
  return getEmojiUrl;
}

function getDimension(dimensionConfig: PickerDimensions): PickerDimensions {
  return typeof dimensionConfig === 'number'
    ? `${dimensionConfig}px`
    : dimensionConfig;
}

export function useSearchResultsConfig(searchResultsCount: number): string {
  const hasResults = searchResultsCount > 0;
  const isPlural = searchResultsCount > 1;

  if (hasResults) {
    return isPlural
      ? SEARCH_RESULTS_MULTIPLE_RESULTS_FOUND.replace(
          '%n',
          searchResultsCount.toString()
        )
      : SEARCH_RESULTS_ONE_RESULT_FOUND;
  }

  return SEARCH_RESULTS_NO_RESULTS_FOUND;
}
