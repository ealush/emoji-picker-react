import * as React from 'react';
import { useState } from 'react';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import { useEmojiMouseEnter } from '../../hooks/useEmojiMouseEnter';
import { useEmojiStyleConfig } from '../context/PickerConfigContext';
import { Emoji } from '../emoji/Emoji';
import Flex from '../Layout/Flex';
import './Footer.css';

export function Footer() {
  const [hoveredEmoji, setHoveredEmoji] = useState<HoveredEmoji>(null);
  const emojiStyle = useEmojiStyleConfig();
  useEmojiMouseEnter(setHoveredEmoji);

  const emoji = emojiByUnified(hoveredEmoji?.originalUnified);

  return (
    <Flex className="epr-footer">
      {emoji && hoveredEmoji ? (
        <Emoji
          unified={hoveredEmoji.unified}
          emoji={emojiByUnified(hoveredEmoji.originalUnified)}
          showVariations={false}
          style={emojiStyle}
          hidden={false}
        />
      ) : null}
    </Flex>
  );
}

export type HoveredEmoji = null | {
  unified: string;
  originalUnified: string;
};
