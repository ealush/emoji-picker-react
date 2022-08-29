import * as React from 'react';
import { useState } from 'react';
import { asEmoji } from '../../dataUtils/asEmoji';
import { emojiByUnified, emojiName } from '../../dataUtils/emojiSelectors';
import { useEmojiMouseEnter } from '../../hooks/useEmojiMouseEnter';
import {
  useEmojiStyleConfig,
  useShowPreviewConfig
} from '../context/PickerConfigContext';
import { Emoji } from '../emoji/Emoji';
import Flex from '../Layout/Flex';
import './Preview.css';

export function Preview() {
  const showPreview = useShowPreviewConfig();
  const [hoveredEmoji, setHoveredEmoji] = useState<HoveredEmoji>(null);
  const emojiStyle = useEmojiStyleConfig();
  useEmojiMouseEnter(showPreview, setHoveredEmoji);

  if (!showPreview) {
    return null;
  }

  const emoji = emojiByUnified(hoveredEmoji?.originalUnified);

  const show = emoji != null && hoveredEmoji != null;

  return (
    <Flex className="epr-preview">
      <PreviewContent />
    </Flex>
  );

  function PreviewContent() {
    if (emoji == undefined) return null;
    return (
      <>
        <div>
          {show ? (
            <Emoji
              unified={hoveredEmoji?.unified as string}
              emoji={asEmoji(emoji)}
              showVariations={false}
              emojiStyle={emojiStyle}
              hidden={false}
              size={45}
            />
          ) : null}
        </div>
        {show ? (
          <div className="epr-preview-emoji-label">{emojiName(emoji)}</div>
        ) : null}
      </>
    );
  }
}

export type HoveredEmoji = null | {
  unified: string;
  originalUnified: string;
};
