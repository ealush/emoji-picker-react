import './data/registerDefaultEmojiData';

import * as React from 'react';

import EmojiPickerReact from './EmojiPickerReact';
import ErrorBoundary from './components/ErrorBoundary';
import { PickerConfig } from './config/config';
import {
  MutableConfigContext,
  useDefineMutableConfig,
} from './config/mutableConfig';

export { ExportedEmoji as Emoji } from './components/emoji/ExportedEmoji';

export {
  EmojiStyle,
  EmojiStyleValue,
  SkinTones,
  Theme,
  ThemeValue,
  Categories,
  EmojiClickData,
  SuggestionMode,
  SuggestionModeValue,
  SkinTonePickerLocation,
  CategoryIcons,
  CategoryConfig,
} from './types/exposedTypes';

export { emojiByUnified } from './dataUtils/emojiSelectors';

export interface PickerProps extends PickerConfig {
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
