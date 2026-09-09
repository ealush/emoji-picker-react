import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import { getLabelHeight } from '../../DomUtils/elementPositionInRow';
import { stylesheet } from '../../Stylesheet/stylesheet';
import { categoryFromCategoryConfig } from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { DataEmojis } from '../../dataUtils/DataTypes';
import { useEmojiVirtualization } from '../../hooks/useEmojiVirtualization';
import { CategoryConfig } from '../../types/exposedTypes';
import { useEmojiListRef } from '../context/ElementRefContext';
import { useVisibleCategoriesState } from '../context/PickerContext';
import { useGetEmojisByCategory } from '../context/PickerDataContext';

import { EmojiCategory } from './EmojiCategory';
import { MeasureEmoji } from './MeasureEmoji';

export function EmojiList({ scrollTop }: { scrollTop: number }) {
  const categories = useCategoriesConfig();
  const [categoryHeights, setCategoryHeights] = React.useState<{
    [key: string]: number;
  }>({});
  const EmojiListRef = useEmojiListRef();
  const getEmojisByCategory = useGetEmojisByCategory();

  const labelHeight = getLabelHeight(EmojiListRef.current);

  let topOffset = 0;
  // role="grid" makes screen readers switch out of virtual-cursor mode so
  // arrow keys reach the picker's keyboard handler. Each category is one
  // rowgroup: visual rows shift under virtualization, so the category is
  // the only stable row unit. Emoji buttons intentionally keep their
  // native button role for activation semantics.
  // https://github.com/ealush/emoji-picker-react/issues/508
  // The list markup is kept for a backwards-compatible DOM structure;
  // the grid role override is intentional (see below).
  // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
  return (
    <ul className={cx(styles.emojiList)} ref={EmojiListRef} role="grid">
      <MeasureEmoji />
      {categories.map((categoryConfig, index) => {
        const category = categoryFromCategoryConfig(categoryConfig);

        const currentOffset = topOffset;
        const categoryHeight = categoryHeights[category];
        if (categoryHeight) {
          topOffset += categoryHeight + labelHeight;
        }

        return (
          <RenderCategory
            key={category}
            categoryEmojis={getEmojisByCategory(category)}
            categoryConfig={categoryConfig}
            topOffset={currentOffset}
            isFirstCategory={index === 0}
            onHeightReady={(height) => {
              if (categoryHeights[category] !== height) {
                setCategoryHeights((prev) => ({
                  ...prev,
                  [category]: height,
                }));
              }
            }}
            scrollTop={scrollTop}
          />
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
  scrollTop,
  isFirstCategory,
}: {
  categoryEmojis: DataEmojis;
  categoryConfig: CategoryConfig;
  topOffset: number;
  onHeightReady: (height: number) => void;
  scrollTop: number;
  isFirstCategory: boolean;
}) {
  const [visibleCategories] = useVisibleCategoriesState();

  // The observer is the only writer of visibleCategories. When it never
  // fires (zero-height container at mount, hidden modal), no category
  // would ever render. The first category paints optimistically to break
  // the deadlock; the observer takes over from there.
  // https://github.com/ealush/emoji-picker-react/issues/469
  // https://github.com/ealush/emoji-picker-react/issues/475
  const isCategoryVisible =
    isFirstCategory || visibleCategories.includes(categoryConfig.category);

  const { virtualizedCounter, emojis, dimensions } = useEmojiVirtualization({
    categoryEmojis,
    topOffset,
    onHeightReady,
    scrollTop,
    isCategoryVisible,
  });

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      height={dimensions?.categoryHeight}
      emojisPerRow={dimensions?.emojisPerRow}
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
    padding: '0',
  },
});
