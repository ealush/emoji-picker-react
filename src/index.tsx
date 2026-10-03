import './data/registerDefaultEmojiData';

import * as React from 'react';

import EmojiPickerReact from './EmojiPickerReact';
import type { ThemeValue } from './types/exposedTypes';
import ErrorBoundary from './components/ErrorBoundary';
import { PickerConfig } from './config/config';
import {
  MutableConfigContext,
  useDefineMutableConfig,
} from './config/mutableConfig';

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
   * Render without the default appearance: no border, background, colors
   * or typography — only layout and behavior. Style it with `className`,
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
      <MutableConfigContext.Provider value={MutableConfigRef}>
        <EmojiPickerReact {...props} />
      </MutableConfigContext.Provider>
    </ErrorBoundary>
  );
}
