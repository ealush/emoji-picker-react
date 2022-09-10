import * as React from 'react';
import { useState } from 'react';

import { useEmojiStyleConfig, usePreviewConfig } from '../../config/useConfig';
import { asEmoji } from '../../dataUtils/asEmoji';
import {
  emojiByUnified,
  emojiName,
  emojiUnified
} from '../../dataUtils/emojiSelectors';
import { useEmojiMouseEnter } from '../../hooks/useEmojiMouseEnter';
import Flex from '../Layout/Flex';
import { Emoji } from '../emoji/Emoji';
import './Preview.css';
import { useEmojiVariationPickerState } from '../context/PickerContext';

export function Preview() {
  const previewConfig = usePreviewConfig();
  const [previewEmoji, setPreviewEmoji] = useState<PreviewEmoji>(null);
  const emojiStyle = useEmojiStyleConfig();
  const [variationPickerEmoji] = useEmojiVariationPickerState();

  useEmojiMouseEnter(previewConfig.showPreview, setPreviewEmoji);

  if (!previewConfig.showPreview) {
    return null;
  }

  const emoji = emojiByUnified(previewEmoji?.originalUnified);

  const show = emoji != null && previewEmoji != null;

  return (
    <Flex className="epr-preview">
      <PreviewContent />
    </Flex>
  );

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
            <Emoji
              unified={previewEmoji?.unified as string}
              emoji={asEmoji(emoji)}
              showVariations={false}
              emojiStyle={emojiStyle}
              hidden={false}
              size={45}
            />
          ) : defaultEmoji ? (
            <Emoji
              unified={emojiUnified(defaultEmoji)}
              emoji={defaultEmoji}
              showVariations={false}
              emojiStyle={emojiStyle}
              hidden={false}
              size={45}
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
