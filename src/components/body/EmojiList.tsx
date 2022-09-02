import * as React from 'react';

import {
  Categories,
  CategoryConfig,
  categoryFromCategoryConfig
} from '../../config/categoryConfig';
import {
  useCategoriesConfig,
  useEmojiStyleConfig
} from '../../config/useConfig';
import { emojisByCategory, emojiUnified } from '../../dataUtils/emojiSelectors';
import { useIsEmojiHidden } from '../../hooks/useIsEmojiHidden';
import {
  useActiveSkinToneState,
  useIsPastInitialLoad
} from '../context/PickerContext';
import { Emoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';
import { RecentlyUsed } from './RecentlyUsed';
import './EmojiList.css';
import { getEmojiRef } from '../../DomUtils/emojiElementRef';

export function EmojiList() {
  const categories = useCategoriesConfig();

  return (
    <ul className="epr-emoji-list">
      {categories.map((categoryConfig, index) => {
        const category = categoryFromCategoryConfig(categoryConfig);

        if (category === Categories.RECENTLY_USED) {
          return (
            <RecentlyUsed key={category} categoryConfig={categoryConfig} />
          );
        }

        return (
          <RenderCategory
            key={category}
            index={index}
            category={category}
            categoryConfig={categoryConfig}
          />
        );
      })}
    </ul>
  );
}

function RenderCategory({
  index,
  category,
  categoryConfig
}: {
  index: number;
  category: Categories;
  categoryConfig: CategoryConfig;
}) {
  const isEmojiHidden = useIsEmojiHidden();
  const emojiStyle = useEmojiStyleConfig();
  const isPastInitialLoad = useIsPastInitialLoad();
  const [activeSkinTone] = useActiveSkinToneState();

  // Small trick to defer the rendering of all emoji categories until the first category is visible
  // This way the user gets to actually see something and not wait for the whole picker to render.
  const emojisToPush =
    !isPastInitialLoad && index > 1 ? [] : emojisByCategory(category);

  let hiddenCounter = 0;

  const emojis = emojisToPush.map(emoji => {
    const unified = emojiUnified(emoji, activeSkinTone);
    const hidden = isEmojiHidden(emoji);
    const emojiRef = getEmojiRef(emojiUnified(emoji));

    if (hidden) {
      hiddenCounter++;
    }

    return (
      <Emoji
        key={unified}
        emoji={emoji}
        unified={unified}
        hidden={hidden}
        emojiStyle={emojiStyle}
        emojiRef={emojiRef}
      />
    );
  });

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      // Indicates that there are no visible emojis
      // Hence, the category should be hidden
      hidden={hiddenCounter === emojis.length}
    >
      {emojis}
    </EmojiCategory>
  );
}
