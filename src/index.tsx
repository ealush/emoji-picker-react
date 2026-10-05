import './data/registerDefaultEmojiData';

import * as React from 'react';

import EmojiPickerReact from './EmojiPickerReact';
import ErrorBoundary from './components/ErrorBoundary';
import { PickerConfig } from './config/config';
import {
  MutableConfigProvider,
  useDefineMutableConfig,
} from './config/mutableConfig';
import type { ThemeValue } from './types/exposedTypes';

export { ExportedEmoji as Emoji } from './components/emoji/ExportedEmoji';

export {
  EmojiStyle,
  SkinTones,
  Theme,
  Categories,
  SuggestionMode,
  SkinTonePickerLocation,
} from './types/exposedTypes';
export type {
  EmojiStyleValue,
  ThemeValue,
  EmojiClickData,
  SuggestionModeValue,
  CategoryIcons,
  CategoryConfig,
} from './types/exposedTypes';

export { emojiByUnified } from './dataUtils/emojiSelectors';

export interface PickerProps extends PickerConfig {
  /**
   * Color scheme: 'light' | 'dark' | 'auto'. Preferred over `theme`, which
   * Emotion, styled-components and MUI reserve on components they wrap
   * (a styled(EmojiPicker) would swallow it). `theme` remains supported.
   */
  colorScheme?: ThemeValue;
  /**
   * Render without Root’s branded border, background, colors or typography.
   * Managed parts retain their functional styles and cosmetic defaults. Style it with `className`,
   * `--epr-*` variables and `[data-epr-part]` selectors.
   */
  unstyled?: boolean;
}
export type Props = PickerProps;

export default function EmojiPicker(props: PickerProps) {
  const MutableConfigRef = useDefineMutableConfig({
    onEmojiClick: props.onEmojiClick,
    onReactionClick: props.onReactionClick,
    onSkinToneChange: props.onSkinToneChange,
    onSearchChange: props.onSearchChange,
    onReactionsModeChange: props.onReactionsModeChange,
  });

  return (
    <ErrorBoundary>
      <MutableConfigProvider value={MutableConfigRef} inheritToRoot>
        <EmojiPickerReact {...props} />
      </MutableConfigProvider>
    </ErrorBoundary>
  );
}
