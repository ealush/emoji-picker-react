import { cx } from 'flairup';
import React, { useEffect, useMemo } from 'react';

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
import { DataEmoji } from '../../dataUtils/DataTypes';
import { emojisByCategory, emojiUnified } from '../../dataUtils/emojiSelectors';
import { useIsEmojiDisallowed } from '../../hooks/useDisallowedEmojis';
import { useIsEmojiHidden } from '../../hooks/useIsEmojiHidden';
import { useEmojiPreload } from '../../hooks/usePreloadEmoji';
import Virtualise from '../Layout/Virtualise';
import { getCategoriesHeight } from '../Layout/helpers';
import { getScrollbarWidth } from '../Layout/helpers/get-scrollbar-width';
import { useBodyRef } from '../context/ElementRefContext';
import {
  useActiveSkinToneState,
  useCategoriesHeightRef,
  useSearchTermState,
  useSetCategoriesHeightRef
} from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';
import { Suggested } from './Suggested';

export function EmojiList() {
  const categories = useCategoriesConfig();
  const isEmojiHidden = useIsEmojiHidden();
  const isEmojiDisallowed = useIsEmojiDisallowed();
  const bodyRef = useBodyRef();
  const bodyWidth = (bodyRef.current && bodyRef.current.clientWidth) || 0;
  const updateCategoriesHeightRef = useSetCategoriesHeightRef();
  const categoriesHeightRef = useCategoriesHeightRef();
  const [searchTerm] = useSearchTermState();

  const scrollbarWidth = useMemo(() => getScrollbarWidth(), []);


  const categoriesMap = useMemo(() => {
    return categories.reduce((acc, category) => {
      const totalEmojis: DataEmoji[] = emojisByCategory(category.category).reduce((emojiAcc, emoji) => {
        const { failedToLoad, filteredOut } = isEmojiHidden(emoji);
        const isDisallowed = isEmojiDisallowed(emoji);

        if (!isDisallowed && !failedToLoad && !filteredOut) {
          emojiAcc.push(emoji);
        }

        return emojiAcc;
      }, [] as DataEmoji[]);

      if (totalEmojis.length > 0) {
        acc.push({
          height: getCategoriesHeight(totalEmojis.length, bodyWidth - scrollbarWidth),
          emojis: totalEmojis,
          category
        });
      }

      return acc;
    }, [] as {height: number; emojis: DataEmoji[]; category: CategoryConfig }[]);
  }, [bodyWidth, categories, isEmojiDisallowed, isEmojiHidden, scrollbarWidth]);

  useEmojiPreload(categoriesMap);

  useEffect(() => {
    if(!bodyWidth || searchTerm) return;
    updateCategoriesHeightRef(categoriesMap);
  },[bodyWidth, categoriesHeightRef, categoriesMap, searchTerm, updateCategoriesHeightRef])

  if (!bodyWidth) return null;

  return (
    <Virtualise className={cx(styles.emojiList)} itemHeights={categoriesMap.map((category) => category.height)}>
      {categoriesMap.map((categoryConfig) => {
        const category = categoryFromCategoryConfig(categoryConfig.category);

        return category === Categories.SUGGESTED ? (
          <Suggested key={category} categoryConfig={categoryConfig.category} />
        ) : (
          <React.Suspense key={category}>
            <RenderCategory emojis={categoryConfig.emojis} categoryConfig={categoryConfig.category} />
          </React.Suspense>
        );
      })}
    </Virtualise>
  );
}

function RenderCategory({
  categoryConfig,
  emojis,
}: {
  categoryConfig: CategoryConfig;
  emojis: DataEmoji[]
}) {
  const lazyLoadEmojis = useLazyLoadEmojisConfig();
  const emojiStyle = useEmojiStyleConfig();
  const [activeSkinTone] = useActiveSkinToneState();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const showVariations = !useSkinTonesDisabledConfig();

  return (
    <EmojiCategory categoryConfig={categoryConfig}>
      {emojis.map(emoji => {
        const unified = emojiUnified(emoji, activeSkinTone);
        return (
          <ClickableEmoji
            showVariations={showVariations}
            key={unified}
            emoji={emoji}
            unified={unified}
            hidden={false}
            hiddenOnSearch={false}
            emojiStyle={emojiStyle}
            lazyLoad={lazyLoadEmojis}
            getEmojiUrl={getEmojiUrl}
          />
        );
      })}
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
