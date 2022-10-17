import * as React from 'react';
import { useState } from 'react';

import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  usePreviewConfig
} from '../../config/useConfig';
import { asEmoji } from '../../dataUtils/asEmoji';
import {
  emojiByUnified,
  emojiName,
  emojiUnified
} from '../../dataUtils/emojiSelectors';
import { useEmojiPreviewEvents } from '../../hooks/useEmojiPreviewEvents';
import { useIsSkinToneInPreview } from '../../hooks/useShouldShowSkinTonePicker';
import Flex from '../Layout/Flex';
import Space from '../Layout/Space';
import { useEmojiVariationPickerState } from '../context/PickerContext';
import { ViewOnlyEmoji } from '../emoji/Emoji';
import './Preview.css';
import { SkinTonePickerMenu } from '../header/SkinTonePicker';

export function Preview() {
  const previewConfig = usePreviewConfig();
  const isSkinToneInPreview = useIsSkinToneInPreview();

  if (!previewConfig.showPreview) {
    return null;
  }

  return (
    <Flex className="epr-preview">
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

  const emoji = emojiByUnified(previewEmoji?.originalUnified);

  const show = emoji != null && previewEmoji != null;

  return <PreviewContent />;

  function PreviewContent() {
    const defaultEmoji = asEmoji(
      variationPickerEmoji ?? emojiByUnified(previewConfig.defaultEmoji)
    );
    const defaultText = variationPickerEmoji
      ? emojiName(variationPickerEmoji)
      : previewConfig.defaultCaption;

    return (
      <>
        <div>
          {show ? (
            <ViewOnlyEmoji
              unified={previewEmoji?.unified as string}
              emoji={asEmoji(emoji)}
              emojiStyle={emojiStyle}
              size={45}
              getEmojiUrl={getEmojiUrl}
            />
          ) : defaultEmoji ? (
            <ViewOnlyEmoji
              unified={emojiUnified(defaultEmoji)}
              emoji={defaultEmoji}
              emojiStyle={emojiStyle}
              size={45}
              getEmojiUrl={getEmojiUrl}
            />
          ) : null}
        </div>
        {show ? (
          <div className="epr-preview-emoji-label">
            {emojiName(asEmoji(emoji))}
          </div>
        ) : (
          <div className="epr-preview-emoji-label">{defaultText}</div>
        )}
      </>
    );
  }
}

export type PreviewEmoji = null | {
  unified: string;
  originalUnified: string;
};
