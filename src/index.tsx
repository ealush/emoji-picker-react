import * as React from 'react';

import EmojiPickerReact from './EmojiPickerReact';
import ErrorBoundary from './components/ErrorBoundary';
import { PickerConfig } from './config/config';
import {
  MutableConfigContext,
  useDefineMutableConfig
} from './config/mutableConfig';

export { ExportedEmoji as Emoji } from './components/emoji/ExportedEmoji';

export {
  EmojiStyle,
  SkinTones,
  Theme,
  Categories,
  EmojiClickData,
  SuggestionMode,
  SkinTonePickerLocation
} from './types/exposedTypes';

export interface PickerProps extends PickerConfig {
  className?: string;
  style?: React.CSSProperties;
}

export default function EmojiPicker(props: PickerProps) {
  const MutableConfigRef = useDefineMutableConfig({
    onEmojiClick: props.onEmojiClick
  });

  return (
    <ErrorBoundary>
      <MutableConfigContext.Provider value={MutableConfigRef}>
        <EmojiPickerReact {...props} />
      </MutableConfigContext.Provider>
    </ErrorBoundary>
  );
}
