import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import { getLabelHeight } from '../../DomUtils/elementPositionInRow';
import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  categoryFromCategoryConfig,
  categoryIdFromCategoryConfig,
  customGroupFromCategoryConfig,
} from '../../config/categoryConfig';
import { useCategoriesConfig } from '../../config/useConfig';
import { DataEmojis } from '../../dataUtils/DataTypes';
import { useEmojiVirtualization } from '../../hooks/useEmojiVirtualization';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import { useRegisterRegion } from '../../hooks/useRegisterRegion';
import { useMergedRefs } from '../../primitives/nativeProps';
import { CategoryConfig } from '../../types/exposedTypes';
import { OVERSCAN_ROWS } from '../../virtualization/virtualizationHelpers';
import { useBodyRef, useEmojiListRef } from '../context/ElementRefContext';
import {
  useEmojiSizeState,
  useVisibleCategoriesState,
} from '../context/PickerContext';
import { useGetEmojisByCategory } from '../context/PickerDataContext';

import { EmojiCategory } from './EmojiCategory';
import { MeasureEmoji } from './MeasureEmoji';

export function EmojiList({
  scrollTop,
  outerRef,
  className,
  nativeProps,
}: {
  scrollTop: number;
  outerRef?: React.Ref<HTMLUListElement>;
  className?: string;
  nativeProps?: Omit<
    React.HTMLAttributes<HTMLUListElement>,
    'role' | 'children' | 'className' | 'ref'
  >;
}) {
  const categories = useCategoriesConfig();
  const [categoryHeights, setCategoryHeights] = React.useState<{
    [key: string]: number;
  }>({});
  const EmojiListRef = useEmojiListRef();
  const BodyRef = useBodyRef();
  const [emojiSize] = useEmojiSizeState();
  const [visibleCategories] = useVisibleCategoriesState();
  const onHeightReady = React.useCallback(
    (categoryId: string, height: number) => {
      setCategoryHeights((previous) =>
        previous[categoryId] === height
          ? previous
          : {
              ...previous,
              [categoryId]: height,
            },
      );
    },
    [],
  );
  // Sections measure in layout effects that run before this list's ref is
  // attached. One synchronous pass once it is lets the first paint show
  // sized sections instead of an empty list.
  const [mounted, setMounted] = React.useState(false);
  useIsomorphicLayoutEffect(() => setMounted(true), []);
  const mergedRef = useMergedRefs(EmojiListRef, outerRef);
  const getEmojisByCategory = useGetEmojisByCategory();
  useRegisterRegion('grid', EmojiListRef);

  const labelHeight = getLabelHeight(EmojiListRef.current);
  const viewportHeight = BodyRef.current?.clientHeight ?? 0;

  let topOffset = 0;
  // A section's offset is real once every section above it is measured.
  let positioned = true;
  // role="grid" makes screen readers switch out of virtual-cursor mode so
  // arrow keys reach the picker's keyboard handler. Each category is one
  // rowgroup: visual rows shift under virtualization, so the category is
  // the only stable row unit. Emoji buttons are gridcells; as native
  // buttons they still activate with Enter and Space.
  // https://github.com/ealush/emoji-picker-react/issues/508
  // The list markup is kept for a backwards-compatible DOM structure;
  // the grid role override is intentional.
  return (
    <ul
      {...nativeProps}
      className={cx(styles.emojiList, className)}
      ref={mergedRef}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
      role="grid"
      data-epr-part="list"
    >
      <MeasureEmoji />
      {categories.map((categoryConfig, index) => {
        const category = categoryFromCategoryConfig(categoryConfig);
        const categoryId = categoryIdFromCategoryConfig(categoryConfig);
        const group = customGroupFromCategoryConfig(categoryConfig);

        const currentOffset = topOffset;
        const isPositioned = positioned;
        positioned = positioned && categoryId in categoryHeights;
        const categoryHeight = categoryHeights[categoryId];
        if (categoryHeight) {
          topOffset += categoryHeight + labelHeight;
        }
        // Measured offsets already place a section in view. Waiting for the
        // observer, which reports after paint, pops sections in one by one.
        const inView =
          positioned &&
          currentOffset < scrollTop + viewportHeight &&
          topOffset > scrollTop;

        return (
          <RenderCategory
            key={categoryId}
            categoryEmojis={getEmojisByCategory(category, group)}
            categoryConfig={categoryConfig}
            topOffset={currentOffset}
            isCategoryVisible={
              index === 0 || inView || visibleCategories.includes(categoryId)
            }
            positioned={isPositioned}
            mounted={mounted}
            onHeightReady={onHeightReady}
            // Outside a section's rendering/preload margin, scrolling
            // cannot change its cells. Keep its prop stable so it can bail.
            scrollTop={
              categoryHeight === undefined
                ? scrollTop
                : Math.max(
                    currentOffset -
                      viewportHeight -
                      (emojiSize || 40) * (OVERSCAN_ROWS + 1),
                    Math.min(
                      scrollTop,
                      currentOffset +
                        categoryHeight +
                        (emojiSize || 40) * (OVERSCAN_ROWS + 1),
                    ),
                  )
            }
          />
        );
      })}
    </ul>
  );
}

const RenderCategory = /* @__PURE__ */ React.memo(function RenderCategory({
  categoryEmojis,
  categoryConfig,
  topOffset,
  onHeightReady,
  scrollTop,
  isCategoryVisible,
  positioned,
  mounted,
}: {
  categoryEmojis: DataEmojis;
  categoryConfig: CategoryConfig;
  topOffset: number;
  onHeightReady: (categoryId: string, height: number) => void;
  scrollTop: number;
  isCategoryVisible: boolean;
  positioned: boolean;
  mounted: boolean;
}) {
  const categoryId = categoryIdFromCategoryConfig(categoryConfig);
  const reportHeight = React.useCallback(
    (height: number) => onHeightReady(categoryId, height),
    [categoryId, onHeightReady],
  );

  // The observer is the only writer of visibleCategories. When it never
  // fires (zero-height container at mount, hidden modal), no category
  // would ever render. The first category paints optimistically to break
  // the deadlock; the observer takes over from there.
  // https://github.com/ealush/emoji-picker-react/issues/469
  // https://github.com/ealush/emoji-picker-react/issues/475
  const { virtualizedCounter, emojis, dimensions, emojiCount } =
    useEmojiVirtualization({
      categoryEmojis,
      topOffset,
      onHeightReady: reportHeight,
      scrollTop,
      isCategoryVisible,
      positioned,
      mounted,
    });

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      height={dimensions?.categoryHeight}
      emojisPerRow={dimensions?.emojisPerRow}
      emojiCount={emojiCount}
      // Indicates that there are no visible emojis
      // Hence, the category should be hidden
      hidden={!emojis.length && virtualizedCounter === 0}
    >
      {emojis}
    </EmojiCategory>
  );
});

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    emojiList: {
      '.': ClassNames.emojiList,
      listStyle: 'none',
      margin: '0',
      padding: '0',
    },
  }))();
