import { cx } from 'flairup';
import React, { useMemo } from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';
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
  useSkinTonesDisabledConfig,
} from '../../config/useConfig';
import { emojisByCategory, emojiUnified } from '../../dataUtils/emojiSelectors';
import { useIsEmojiDisallowed } from '../../hooks/useDisallowedEmojis';
import { useIsEmojiHidden } from '../../hooks/useIsEmojiHidden';
import Virtualise from '../Layout/Virtualise';
import {
  useActiveSkinToneState,
  useIsPastInitialLoad
} from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';
import { Suggested } from './Suggested';

const getCategroriesHeight = (categoryConfig: CategoryConfig) => {
  const eprBody = document.querySelector('.epr-body');
  if (!eprBody) return 0;

  const totalEmojis = emojisByCategory(categoryConfig.category);
  if (!totalEmojis.length) return 0;

  const noOfEmojisInARow = Math.floor(eprBody.clientWidth / 40);
  const noOfRows = Math.ceil(totalEmojis.length / noOfEmojisInARow);
  return (noOfRows + 1) * 40;
};

export function EmojiList() {
  const categories = useCategoriesConfig();
  const itemHeights = useMemo(() => categories.map(getCategroriesHeight), [categories]);

  const bodyWidth = document.querySelector('.epr-body')?.clientWidth;

  if (!bodyWidth) return null;

  return (
    <Virtualise className={cx(styles.emojiList)} itemHeights={itemHeights.filter(Boolean)}>
      {categories.map((categoryConfig, index) => {
        if (!itemHeights[index]) return null;
        const category = categoryFromCategoryConfig(categoryConfig);

        return category === Categories.SUGGESTED ? (
          <Suggested key={category} categoryConfig={categoryConfig} />
        ) : (
          <React.Suspense key={category}>
            <RenderCategory category={category} categoryConfig={categoryConfig} />
          </React.Suspense>
        );
      }).filter(Boolean)}
    </Virtualise>
  );
}

function RenderCategory({
  category,
  categoryConfig,
}: {
  category: Categories;
  categoryConfig: CategoryConfig;
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
    !isPastInitialLoad
      ? []
      : emojisByCategory(category);

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

const styles = stylesheet.create({
  emojiList: {
    '.': ClassNames.emojiList,
    listStyle: 'none',
    margin: '0',
    padding: '0'
  }
});