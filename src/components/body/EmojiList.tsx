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

const getCategroriesHeight = (categoryConfig: CategoryConfig, width?: number) => {
  const mainContent = document.querySelector('.epr-main')
  if (!width || !mainContent) return 0;

  const categoryPadding = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-category-padding"))
  const emojiSize = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-emoji-size"))
  const emojiPadding = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-emoji-padding"))
  const categoryLabelHeight = parsePadding(getComputedStyle(mainContent).getPropertyValue("--epr-category-label-height"))
  const totalEmojiWidth = emojiSize.left + emojiPadding.left + emojiPadding.right;
  const totalEmojiHeight = emojiSize.top + emojiPadding.top + emojiPadding.bottom;

  const totalEmojis = emojisByCategory(categoryConfig.category);
  if (!totalEmojis.length) return 0;

  const noOfEmojisInARow = Math.floor((width - categoryPadding.left - categoryPadding.right) / totalEmojiWidth);
  const noOfRows = Math.ceil(totalEmojis.length / noOfEmojisInARow);
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
  const bodyWidth = document.querySelector('.epr-body')?.clientWidth;
  const itemHeights = useMemo(() => categories.map((category) => getCategroriesHeight(category,bodyWidth)), [bodyWidth, categories]);

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