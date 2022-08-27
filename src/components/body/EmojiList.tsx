import * as React from 'react';
import { categoryFromCategoryConfig } from '../../config/categoryConfig';
import emojisByCategory from '../../dataUtils/emojisByCategory';
import { emojiUnified } from '../../dataUtils/emojiSelectors';
import { useIsEmojiHidden } from '../../hooks/useIsEmojiHidden';
import {
  useCategoriesConfig,
  useEmojiStyleConfig
} from '../context/PickerConfigContext';
import {
  useActiveSkinToneState,
  useIsPastInitialLoad
} from '../context/PickerContext';
import { Emoji } from '../emoji/Emoji';
import { EmojiCategory } from './EmojiCategory';
import './EmojiList.css';

export function EmojiList() {
  const categories = useCategoriesConfig();
  const isPastInitialLoad = useIsPastInitialLoad();
  const [activeSkinTone] = useActiveSkinToneState();
  const isEmojiHidden = useIsEmojiHidden();
  const emojiStyle = useEmojiStyleConfig();

  return (
    <ul className="epr-emoji-list">
      {categories.map((categoryConfig, index) => {
        const category = categoryFromCategoryConfig(categoryConfig);

        // Small trick to defer the rendering of all emoji categories until the first category is visible
        // This way the user gets to actually see something and not wait for the whole picker to render.
        let emojisToPush =
          !isPastInitialLoad && index > 0 ? [] : emojisByCategory(category);

        return (
          <EmojiCategory categoryConfig={categoryConfig} key={category}>
            {emojisToPush.map(emoji => {
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
          </EmojiCategory>
        );
      })}
    </ul>
  );
}
