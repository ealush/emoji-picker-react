import * as React from 'react';
import { useState } from 'react';
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

  const show = emoji && hoveredEmoji;

  return (
    <Flex className="epr-preview">
      <div>
        {show ? (
          <Emoji
            unified={hoveredEmoji.unified}
            emoji={emoji}
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
    </Flex>
  );
}

export type HoveredEmoji = null | {
  unified: string;
  originalUnified: string;
};
