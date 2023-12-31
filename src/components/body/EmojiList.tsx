import { cx } from 'css-local';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { sheet } from '../../DomUtils/stylesheet';
import {
  Categories,
  CategoryConfig,
  categoryFromCategoryConfig
} from '../../config/categoryConfig';
import {
  useCategoriesConfig,
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useLazyLoadEmojisConfig,
  useSkinTonesDisabledConfig
} from '../../config/useConfig';
import { emojisByCategory, emojiUnified } from '../../dataUtils/emojiSelectors';
import { useIsEmojiDisallowed } from '../../hooks/useDisallowedEmojis';
import { useIsEmojiHidden } from '../../hooks/useIsEmojiHidden';
import {
  useActiveSkinToneState,
  useIsPastInitialLoad
} from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';
import { Suggested } from './Suggested';

const styles = sheet.create({
  emojiList: {
    '.': ClassNames.emojiList,
    listStyle: 'none',
    padding: 0,
    margin: 0
  }
});

export function EmojiList() {
  const categories = useCategoriesConfig();
  const renderdCategoriesCountRef = React.useRef(0);

  return (
    <ul className={cx(styles.emojiList)}>
      {categories.map(categoryConfig => {
        const category = categoryFromCategoryConfig(categoryConfig);

        if (category === Categories.SUGGESTED) {
          return <Suggested key={category} categoryConfig={categoryConfig} />;
        }

        return (
          <RenderCategory
            key={category}
            category={category}
            categoryConfig={categoryConfig}
            renderdCategoriesCountRef={renderdCategoriesCountRef}
          />
        );
      })}
    </ul>
  );
}

function RenderCategory({
  category,
  categoryConfig,
  renderdCategoriesCountRef
}: {
  category: Categories;
  categoryConfig: CategoryConfig;
  renderdCategoriesCountRef: React.MutableRefObject<number>;
}) {
  const isEmojiHidden = useIsEmojiHidden();
  const lazyLoadEmojis = useLazyLoadEmojisConfig();
  const emojiStyle = useEmojiStyleConfig();
  const isPastInitialLoad = useIsPastInitialLoad();
  const [activeSkinTone] = useActiveSkinToneState();
  const isEmojiDisallowed = useIsEmojiDisallowed();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const showVariations = !useSkinTonesDisabledConfig();

  // Small trick to defer the rendering of all emoji categories until the first category is visible
  // This way the user gets to actually see something and not wait for the whole picker to render.
  const emojisToPush =
    !isPastInitialLoad && renderdCategoriesCountRef.current > 0
      ? []
      : emojisByCategory(category);

  if (emojisToPush.length > 0) {
    renderdCategoriesCountRef.current++;
  }

  let hiddenCounter = 0;

  const emojis = emojisToPush.map(emoji => {
    const unified = emojiUnified(emoji, activeSkinTone);
    const { failedToLoad, filteredOut, hidden } = isEmojiHidden(emoji);

    const isDisallowed = isEmojiDisallowed(emoji);

    if (hidden || isDisallowed) {
      hiddenCounter++;
    }

    if (isDisallowed) {
      return null;
    }

    return (
      <ClickableEmoji
        showVariations={showVariations}
        key={unified}
        emoji={emoji}
        unified={unified}
        hidden={failedToLoad}
        hiddenOnSearch={filteredOut}
        emojiStyle={emojiStyle}
        lazyLoad={lazyLoadEmojis}
        getEmojiUrl={getEmojiUrl}
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
