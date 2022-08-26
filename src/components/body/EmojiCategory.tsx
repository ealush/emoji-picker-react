import * as React from 'react';
import { DataEmojis } from '../../dataUtils/DataTypes';
import './EmojiCategory.css';
import { Emoji } from '../emoji/Emoji';
import { emojiUnified } from '../../dataUtils/emojiSelectors';
import { useActiveSkinToneState } from '../context/PickerContext';
import { useIsEmojiHidden } from '../../hooks/useIsEmojiHidden';
import { useEmojiStyleConfig } from '../context/PickerConfigContext';
import {
  CategoryConfig,
  categoryFromCategoryConfig,
  categoryNameFromCategoryConfig
} from '../../config/categoryConfig';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
  emojis: DataEmojis;
}>;

export function EmojiCategory({ categoryConfig, emojis }: Props) {
  const emojiStyle = useEmojiStyleConfig();
  const [activeSkinTone] = useActiveSkinToneState();
  const isEmojiHidden = useIsEmojiHidden();
  const category = categoryFromCategoryConfig(categoryConfig);
  const categoryName = categoryNameFromCategoryConfig(categoryConfig);

  return (
    <li className="epr-emoji-category" data-name={category}>
      <div className="epr-emoji-category-label">{categoryName}</div>
      {emojis.map(emoji => {
        const unified = emojiUnified(emoji, activeSkinTone);
        const hidden = isEmojiHidden(emoji);

        return (
          <Emoji
            key={unified}
            emoji={emoji}
            unified={unified}
            hidden={hidden}
            emojiStyle={emojiStyle}
          />
        );
      })}
    </li>
  );
}
