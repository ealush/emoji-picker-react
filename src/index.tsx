import * as React from 'react';

// The batteries-included entry promises synchronous access to the English
// dataset. The primitives entry intentionally leaves this unregistered so
// compositions can load it on demand.
import './data/registerDefaultEmojiData';

import EmojiPickerReact from './EmojiPickerReact';
import ErrorBoundary from './components/ErrorBoundary';
import { PickerConfig } from './config/config';
import {
  MutableConfigProvider,
  useDefineMutableConfig,
} from './config/mutableConfig';

export { ExportedEmoji as Emoji } from './components/emoji/ExportedEmoji';

export {
  EmojiStyle,
  SkinTones,
  Theme,
  Categories,
  EmojiClickData,
  SuggestionMode,
  SkinTonePickerLocation,
  CategoryIcons,
  CategoryConfig,
} from './types/exposedTypes';

export { emojiByUnified } from './dataUtils/emojiSelectors';

export interface PickerProps extends PickerConfig {}
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
