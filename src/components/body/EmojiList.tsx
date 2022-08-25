import * as React from 'react';
import categories from '../../dataUtils/categories';
import emojisByCategory from '../../dataUtils/emojisByCategory';
import { useIsPastInitialLoad } from '../contextProvider/PickerContextProvider';
import { EmojiCategory } from './EmojiCategory';
import './EmojiList.css';

export function EmojiList() {
  const isPastInitialLoad = useIsPastInitialLoad();
  return (
    <ul className="epr-emoji-list">
      {categories.map((category, index) => {
        // Small trick to defer the rendering of all emoji categories until the first category is visible
        // This way the user gets to actually see something and not wait for the whole picker to render.
        let emojisToPush =
          !isPastInitialLoad && index > 0 ? [] : emojisByCategory(category);
        return (
          <EmojiCategory
            category={category}
            key={category}
            emojis={emojisToPush}
          />
        );
      })}
    </ul>
  );
}
