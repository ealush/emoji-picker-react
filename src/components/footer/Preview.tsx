import { cx } from 'flairup';
import * as React from 'react';
import { useState } from 'react';

import {
  commonInteractionStyles,
  stylesheet
} from '../../Stylesheet/stylesheet';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  usePreviewConfig
} from '../../config/useConfig';
import {
  emojiByUnified,
  emojiName,
  emojiUnified
} from '../../dataUtils/emojiSelectors';
import { useEmojiPreviewEvents } from '../../hooks/useEmojiPreviewEvents';
import { useIsSkinToneInPreview } from '../../hooks/useShouldShowSkinTonePicker';
import Flex from '../Layout/Flex';
import Space from '../Layout/Space';
import {
  useEmojiVariationPickerState,
  useReactionsModeState
} from '../context/PickerContext';
import { ViewOnlyEmoji } from '../emoji/ViewOnlyEmoji';
import { SkinTonePickerMenu } from '../header/SkinTonePicker/SkinTonePicker';

export function Preview() {
  const previewConfig = usePreviewConfig();
  const isSkinToneInPreview = useIsSkinToneInPreview();
  const [reactionsOpen] = useReactionsModeState();

  if (!previewConfig.showPreview) {
    return null;
  }

  return (
    <Flex
      className={cx(
        styles.preview,
        commonInteractionStyles.hiddenOnReactions,
        reactionsOpen && styles.hideOnReactions
      )}
    >
      <PreviewBody />
      <Space />
      {isSkinToneInPreview ? <SkinTonePickerMenu /> : null}
    </Flex>
  );
}

export function PreviewBody() {
  const previewConfig = usePreviewConfig();
  const [previewEmoji, setPreviewEmoji] = useState<PreviewEmoji>(null);
  const emojiStyle = useEmojiStyleConfig();
  const [variationPickerEmoji] = useEmojiVariationPickerState();
  const getEmojiUrl = useGetEmojiUrlConfig();

  useEmojiPreviewEvents(previewConfig.showPreview, setPreviewEmoji);

  const emoji = emojiByUnified(
    previewEmoji?.unified ?? previewEmoji?.originalUnified
  );

  const show = emoji != null && previewEmoji != null;

  return <PreviewContent />;

  function PreviewContent() {
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
              size={45}
              getEmojiUrl={getEmojiUrl}
              className={cx(styles.emoji)}
            />
          ) : defaultEmoji ? (
            <ViewOnlyEmoji
              unified={emojiUnified(defaultEmoji)}
              emoji={defaultEmoji}
              emojiStyle={emojiStyle}
              size={45}
              getEmojiUrl={getEmojiUrl}
              className={cx(styles.emoji)}
            />
          ) : null}
        </div>
        <div className={cx(styles.label)}>
          {show ? emojiName(emoji) : defaultText}
        </div>
      </>
    );
  }
}

export type PreviewEmoji = null | {
  unified: string;
  originalUnified: string;
};

const styles = stylesheet.create({
  preview: {
    alignItems: 'center',
    borderTop: '1px solid var(--epr-preview-border-color)',
    height: 'var(--epr-preview-height)',
    padding: '0 var(--epr-horizontal-padding)',
    position: 'relative',
    zIndex: 'var(--epr-preview-z-index)'
  },
  label: {
    color: 'var(--epr-preview-text-color)',
    fontSize: 'var(--epr-preview-text-size)',
    padding: 'var(--epr-preview-text-padding)',
    textTransform: 'capitalize'
  },
  emoji: {
    padding: '0'
  },
  hideOnReactions: {
    opacity: '0',
    transition: 'opacity 0.5s ease-in-out'
  }
});
