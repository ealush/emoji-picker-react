import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { getLabelHeight } from '../../DomUtils/elementPositionInRow';
import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  CategoryConfig,
  categoryFromCategoryConfig
} from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { DataEmojis } from '../../dataUtils/DataTypes';
import { useGetEmojisByCategory } from '../../dataUtils/emojiSelectors';
import { useEmojiVirtualization } from '../../hooks/useEmojiVirtualization';
import { useEmojiListRef } from '../context/ElementRefContext';
import { useVisibleCategoriesState } from '../context/PickerContext';

import { EmojiCategory } from './EmojiCategory';

export function EmojiList({ scrollTop }: { scrollTop: number }) {
  const categories = useCategoriesConfig();
  const [categoryHeights, setCategoryHeights] = React.useState<{
    [key: string]: number;
  }>({});
  const EmojiListRef = useEmojiListRef();
  const getEmojisByCategory = useGetEmojisByCategory();

  const labelHeight = getLabelHeight(EmojiListRef.current);

  let topOffset = 0;
  return (
    <ul className={cx(styles.emojiList)} ref={EmojiListRef}>
      {categories.map(categoryConfig => {
        const category = categoryFromCategoryConfig(categoryConfig);

        const currentOffset = topOffset;
        const categoryHeight = categoryHeights[category];
        if (categoryHeight) {
          topOffset += categoryHeight + labelHeight;
        }

        return (
          <React.Suspense key={category}>
            <RenderCategory
              categoryEmojis={getEmojisByCategory(category)}
              categoryConfig={categoryConfig}
              topOffset={currentOffset}
              onHeightReady={height => {
                if (categoryHeights[category] !== height) {
                  setCategoryHeights(prev => ({
                    ...prev,
                    [category]: height
                  }));
                }
              }}
              scrollTop={scrollTop}
            />
          </React.Suspense>
        );
      })}
    </ul>
  );
}

function RenderCategory({
  categoryEmojis,
  categoryConfig,
  topOffset,
  onHeightReady,
  scrollTop
}: {
  categoryEmojis: DataEmojis;
  categoryConfig: CategoryConfig;
  topOffset: number;
  onHeightReady: (height: number) => void;
  scrollTop: number;
}) {
  const [visibleCategories] = useVisibleCategoriesState();

  const { virtualizedCounter, emojis, dimensions } = useEmojiVirtualization({
    categoryEmojis,
    topOffset,
    onHeightReady,
    scrollTop,
    isCategoryVisible: visibleCategories.includes(categoryConfig.category)
  });

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      height={dimensions?.categoryHeight}
      // Indicates that there are no visible emojis
      // Hence, the category should be hidden
      hidden={!emojis.length && virtualizedCounter === 0}
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
