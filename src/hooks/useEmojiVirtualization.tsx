 
 import { ReactNode, useEffect } from 'react';
import * as React from 'react';

import { useBodyRef } from '../components/context/ElementRefContext';
import { useActiveSkinToneState } from '../components/context/PickerContext';
import { ClickableEmoji } from '../components/emoji/Emoji';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useLazyLoadEmojisConfig,
  useSkinTonesDisabledConfig
} from '../config/useConfig';
import { DataEmojis } from '../dataUtils/DataTypes';
import { emojiUnified } from '../dataUtils/emojiSelectors';
import {
  getEmojiPositionStyle,
  shouldVirtualize
} from '../virtualization/virtualizationHelpers';

import { preloadEmojiIfNeeded } from './preloadEmoji';
import { useCategoryHeight } from './useCategoryHeight';
import { useIsEmojiDisallowed } from './useDisallowedEmojis';
import { useIsEmojiHidden } from './useIsEmojiHidden';

export function useEmojiVirtualization({
  categoryEmojis,
  topOffset,
  onHeightReady,
  scrollTop,
  isCategoryVisible
}: {
  categoryEmojis: DataEmojis;
  topOffset: number;
  onHeightReady: (height: number) => void;
  scrollTop: number;
  isCategoryVisible: boolean;
}) {
  const isEmojiHidden = useIsEmojiHidden();
  const lazyLoadEmojis = useLazyLoadEmojisConfig();
  const emojiStyle = useEmojiStyleConfig();
  const [activeSkinTone] = useActiveSkinToneState();
  const isEmojiDisallowed = useIsEmojiDisallowed();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const showVariations = !useSkinTonesDisabledConfig();
  const BodyRef = useBodyRef();

  let virtualizedCounter = 0;

  const emojisToPush = categoryEmojis.filter(emoji => {
    const isDisallowed = isEmojiDisallowed(emoji);
    const { failedToLoad, filteredOut, hidden } = isEmojiHidden(emoji);

    return !failedToLoad && !filteredOut && !hidden && !isDisallowed;
  });

  const dimensions = useCategoryHeight(emojisToPush.length);

  useEffect(() => {
    if (dimensions) {
      onHeightReady(dimensions.categoryHeight);
    }
  }, [dimensions, onHeightReady, emojisToPush.length]);

  const isVirtualized = (style: { top: number; left: number } | undefined) =>
    dimensions &&
    BodyRef.current &&
    shouldVirtualize({
      scrollTop,
      clientHeight: BodyRef.current?.clientHeight ?? 0,
      topOffset,
      style,
      dimensions
    });

  const emojis = emojisToPush.reduce((accumulator, emoji, index) => {
    const unified = emojiUnified(emoji, activeSkinTone);
    const style = getEmojiPositionStyle(dimensions, index);

    if (isVirtualized(style)) {
      virtualizedCounter++;
      preloadEmojiIfNeeded(
        emoji,
        emojiStyle,
        scrollTop,
        BodyRef.current?.clientHeight ?? 0,
        topOffset,
        style,
        dimensions,
        getEmojiUrl
      );
      return accumulator;
    }

    if (!isCategoryVisible) {
      virtualizedCounter++;
      return accumulator;
    }

    accumulator.push(
      <ClickableEmoji
        showVariations={showVariations}
        key={unified}
        emoji={emoji}
        unified={unified}
        emojiStyle={emojiStyle}
        lazyLoad={lazyLoadEmojis}
        getEmojiUrl={getEmojiUrl}
        style={{
          ...style,
          position: 'absolute'
        }}
      />
    );
    return accumulator;
  }, [] as ReactNode[]);

  return {
    virtualizedCounter,
    emojis,
    dimensions
  };
}
