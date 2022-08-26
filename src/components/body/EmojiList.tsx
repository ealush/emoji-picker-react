import * as React from 'react';
import { categoryFromCategoryConfig } from '../../config/categoryConfig';
import emojisByCategory from '../../dataUtils/emojisByCategory';
import { useCategoriesConfig } from '../context/PickerConfigContext';
import { useIsPastInitialLoad } from '../context/PickerContext';
import { EmojiCategory } from './EmojiCategory';
import './EmojiList.css';

export function EmojiList() {
  const categories = useCategoriesConfig();
  const isPastInitialLoad = useIsPastInitialLoad();
  return (
    <ul className="epr-emoji-list">
      {categories.map((categoryConfig, index) => {
        const category = categoryFromCategoryConfig(categoryConfig);

        // Small trick to defer the rendering of all emoji categories until the first category is visible
        // This way the user gets to actually see something and not wait for the whole picker to render.
        let emojisToPush =
          !isPastInitialLoad && index > 0 ? [] : emojisByCategory(category);

        return (
          <EmojiCategory
            categoryConfig={categoryConfig}
            key={category}
            emojis={emojisToPush}
          />
        );
      })}
    </ul>
  );
}
