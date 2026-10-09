import * as React from 'react';
import { cx } from 'shipstyles';

import {
  commonInteractionStyles,
  stylesheet,
} from '../../Stylesheet/stylesheet';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  usePreviewConfig,
} from '../../config/useConfig';
import { emojiName, emojiUnified } from '../../dataUtils/emojiUtils';
import { useDefaultAppearance } from '../../primitives/appearance';
import Flex from '../Layout/Flex';
import Space from '../Layout/Space';
import {
  ActiveEmojiState,
  useActiveEmojiState,
  useEmojiVariationPickerState,
  useReactionsModeState,
} from '../context/PickerContext';
import { usePickerDataContext } from '../context/PickerDataContext';
import { ViewOnlyEmoji } from '../emoji/ViewOnlyEmoji';

export function Preview({ children }: { children?: React.ReactNode }) {
  const appearance = useDefaultAppearance();
  const [reactionsOpen] = useReactionsModeState();

  return (
    <Flex
      className={cx(
        styles.previewGeometry,
        appearance && styles.preview,
        appearance && commonInteractionStyles.hiddenOnReactions,
        appearance && reactionsOpen && styles.hideOnReactions,
      )}
    >
      <PreviewBody />
      <Space />
      {children}
    </Flex>
  );
}

// eslint-disable-next-line complexity
export function PreviewBody() {
  const appearance = useDefaultAppearance();
  const previewConfig = usePreviewConfig();
  const [previewEmoji] = useActiveEmojiState();
  const emojiStyle = useEmojiStyleConfig();
  const [variationPickerEmoji] = useEmojiVariationPickerState();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const { emojiByUnified } = usePickerDataContext();

  const emoji = previewEmoji
    ? emojiByUnified(previewEmoji.unified || previewEmoji.originalUnified)
    : undefined;

  const show = emoji != null;

  // Rendered inline rather than as a nested component: a component defined
  // inside render gets a new identity every render, which remounted the
  // preview (and reloaded its image) on every hover.
  const defaultEmoji =
    variationPickerEmoji ?? emojiByUnified(previewConfig.defaultEmoji);
  if (!defaultEmoji) {
    return null;
  }
  const defaultText = variationPickerEmoji
    ? emojiName(variationPickerEmoji)
    : previewConfig.defaultCaption;

  return (
    <>
      <div>
        {show ? (
          <ViewOnlyEmoji
            unified={previewEmoji?.unified as string}
            emoji={emoji}
            emojiStyle={emojiStyle}
            size={PREVIEW_EMOJI_SIZE}
            getEmojiUrl={getEmojiUrl}
            className={cx(styles.emoji)}
          />
        ) : (
          <ViewOnlyEmoji
            unified={emojiUnified(defaultEmoji)}
            emoji={defaultEmoji}
            emojiStyle={emojiStyle}
            size={PREVIEW_EMOJI_SIZE}
            getEmojiUrl={getEmojiUrl}
            className={cx(styles.emoji)}
          />
        )}
      </div>
      <div className={cx(styles.labelGeometry, appearance && styles.label)}>
        {show ? emojiName(emoji) : defaultText}
      </div>
    </>
  );
}

export type PreviewEmoji = ActiveEmojiState;

// Tokenized so compact previews can shrink the emoji (default 45px).
const PREVIEW_EMOJI_SIZE = 'var(--epr-preview-emoji-size)';

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    previewGeometry: {
      alignItems: 'center',
      height: 'var(--epr-preview-height)',
      padding: '0 var(--epr-horizontal-padding)',
      position: 'relative',
      zIndex: 'var(--epr-preview-z-index)',
    },
    labelGeometry: { padding: 'var(--epr-preview-text-padding)' },
    preview: {
      borderTop: '1px solid var(--epr-preview-border-color)',
      zIndex: 'var(--epr-preview-z-index)',
    },
    label: {
      color: 'var(--epr-preview-text-color)',
      fontSize: 'var(--epr-preview-text-size)',
      textTransform: 'capitalize',
    },
    emoji: {
      padding: '0',
    },
    hideOnReactions: {
      opacity: '0',
      transition: 'opacity 0.5s ease-in-out',
    },
  }))();
