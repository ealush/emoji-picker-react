import * as React from 'react';
import EmojiPickerReact from './EmojiPickerReact';
import { PickerConfig } from './config/config';
import ErrorBoundary from './components/ErrorBoundary';
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
