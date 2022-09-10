import * as React from 'react';

import EmojiPickerReact from './EmojiPickerReact';
import ErrorBoundary from './components/ErrorBoundary';
import { PickerConfig } from './config/config';

export {
  EmojiStyle,
  SkinTones,
  Theme,
  Categories,
  EmojiClickData
} from './types/exposedTypes';

export interface Props extends PickerConfig {}

export default function EmojiPicker(props: Props) {
  return (
    <ErrorBoundary>
      <EmojiPickerReact {...props} />
    </ErrorBoundary>
  );
}
