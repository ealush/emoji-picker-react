import { cx } from 'flairup';
import React, { useMemo } from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';
import {
  Categories,
  CategoriesConfig,
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
import Virtualise from '../Layout/Virtualise';
import {
  useActiveSkinToneState
} from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';
import { Suggested } from './Suggested';

const getCategoriesHeight = (totalEmojis: number, width?: number) => {
  const mainContent = document.querySelector('.epr-main')
  if (!width || !mainContent) return 0;

  const categoryPadding = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-category-padding"))
  const emojiSize = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-emoji-size"))
  const emojiPadding = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-emoji-padding"))
  const categoryLabelHeight = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-category-label-height"))
  const totalEmojiWidth = emojiSize.left + emojiPadding.left + emojiPadding.right;
  const totalEmojiHeight = emojiSize.top + emojiPadding.top + emojiPadding.bottom;

  if (!totalEmojis) return 0;

  const noOfEmojisInARow = Math.floor((width - categoryPadding.left - categoryPadding.right) / totalEmojiWidth);
  const noOfRows = Math.ceil(totalEmojis / noOfEmojisInARow);
  return (noOfRows * totalEmojiHeight) + categoryLabelHeight.left;
};

type PaddingValue = {
  value: number;
  unit: string;
};

type Padding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

// Helper function to convert different units to pixels
function convertToPx(value: number, unit: string, fontSize: number, rootFontSize: number): number {
    switch (unit) {
        case 'px':
            return value; // already in pixels
        case 'rem':
            return value * rootFontSize; // root font size is default 16px
        case 'em':
            return value * fontSize; // font size of the element
        default:
            return value; // assuming value is in pixels if unit is unknown
    }
}

// Function to extract value and unit
function parseValue(value: string): PaddingValue {
    const match = value.match(/^([\d.]+)(\D+)$/);
    return match ? { value: parseFloat(match[1]), unit: match[2] } : { value: parseFloat(value), unit: '' };
}


function parsePadding(paddingString: string, fontSize: number = 16, rootFontSize: number = 16): Padding {
  const values: PaddingValue[] = paddingString.split(' ').map(value => parseValue(value));

  let top: number, right: number, bottom: number, left: number;

  if (values.length === 1) {
      // If only one value is provided, it applies to all sides
      top = right = bottom = left = convertToPx(values[0].value, values[0].unit, fontSize, rootFontSize);
  } else if (values.length === 2) {
      // If two values are provided: [top-bottom, left-right]
      top = bottom = convertToPx(values[0].value, values[0].unit, fontSize, rootFontSize);
      right = left = convertToPx(values[1].value, values[1].unit, fontSize, rootFontSize);
  } else if (values.length === 3) {
      // If three values are provided: [top, left-right, bottom]
      top = convertToPx(values[0].value, values[0].unit, fontSize, rootFontSize);
      right = left = convertToPx(values[1].value, values[1].unit, fontSize, rootFontSize);
      bottom = convertToPx(values[2].value, values[2].unit, fontSize, rootFontSize);
  } else if (values.length === 4) {
      // If four values are provided: [top, right, bottom, left]
      [top, right, bottom, left] = values.map(v => convertToPx(v.value, v.unit, fontSize, rootFontSize));
  } else {
      // Handle unexpected cases
      top = right = bottom = left = 0;
  }

  return { top, right, bottom, left };
}

export function EmojiList() {
  const categories = useCategoriesConfig();
  const isEmojiHidden = useIsEmojiHidden();
  const isEmojiDisallowed = useIsEmojiDisallowed();
  const bodyWidth = document.querySelector('.epr-body')?.clientWidth;


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
          height: getCategoriesHeight(totalEmojis.length, bodyWidth),
          emojis: totalEmojis,
          category
        });
      }

      return acc;
    }, [] as {height: number; emojis: DataEmoji[]; category: CategoryConfig }[]);
  }, [bodyWidth, categories, isEmojiDisallowed, isEmojiHidden]);


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
      }).filter(Boolean)}
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