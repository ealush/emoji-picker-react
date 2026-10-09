// The batteries-included entry promises synchronous access to the English
// dataset. The primitives entry intentionally leaves this unregistered so
// compositions can load it on demand.
import './data/registerDefaultEmojiData';

import * as React from 'react';

import EmojiPickerReact from './EmojiPickerReact';
import ErrorBoundary from './components/ErrorBoundary';
import { PickerConfig } from './config/config';
import {
  MutableConfigProvider,
  useDefineMutableConfig,
} from './config/mutableConfig';
import type { PickerComponents } from './primitives/components';
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
  SkinTonesValue,
  EmojiClickData,
  SuggestionModeValue,
  CategoryIcons,
  CategoryConfig,
  EmojiData,
} from './types/exposedTypes';
export type {
  PickerLabels,
  PreviewConfig,
  EmojiClickHandler,
  SkinToneChangeHandler,
  OnEmojiClickApi,
} from './config/config';
export type { CustomEmoji } from './config/customEmojiConfig';
export type {
  EmojiDataInput,
  EmojiDataLoader,
  EmojiDataLoaderOptions,
} from './hooks/useResolvedEmojiData';
export type {
  CategoryHeaderRenderProps,
  EmojiRenderProps,
  ListComponents,
  ListEmoji,
} from './components/body/listComponents';

export { emojiByUnified } from './dataUtils/emojiSelectors';

// The default picker forwards identifying attributes, but leaves event handlers
// and library-owned roles to the primitives or a consumer wrapper.
export interface PickerProps
  extends
    PickerConfig,
    React.AriaAttributes,
    Pick<React.HTMLAttributes<HTMLElement>, 'id' | 'title' | 'lang' | 'dir'> {
  /**
   * Color scheme: 'light' | 'dark' | 'auto'. Preferred over `theme`, which
   * Emotion, styled-components and MUI reserve on components they wrap
   * (a styled(EmojiPicker) would swallow it). `theme` remains supported.
   */
  colorScheme?: ThemeValue;
  /**
   * Render without decorative styling on every managed part.
   * Geometry, presence and navigation remain managed. Style it with `className`,
   * `--epr-*` variables and `[data-epr-part]` selectors.
   */
  unstyled?: boolean;
  /** Shared replacements for interactive controls and category headers. */
  components?: PickerComponents;
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

export type {
  PickerComponents,
  CategoryButtonRenderProps,
  SkinToneButtonRenderProps,
} from './primitives/components';
