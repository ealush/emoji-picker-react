import { ReactNode, useEffect } from 'react';
import * as React from 'react';

import { useBodyRef } from '../components/context/ElementRefContext';
import {
  useActiveSkinToneState,
  useRequestNativeProbe,
} from '../components/context/PickerContext';
import { ClickableEmoji } from '../components/emoji/Emoji';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useLazyLoadEmojisConfig,
  useSkinTonesDisabledConfig,
} from '../config/useConfig';
import { DataEmojis } from '../dataUtils/DataTypes';
import { emojiUnified } from '../dataUtils/emojiUtils';
import {
  getEmojiPositionStyle,
  shouldVirtualize,
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
  isCategoryVisible,
  positioned,
}: {
  categoryEmojis: DataEmojis;
  topOffset: number;
  onHeightReady: (height: number) => void;
  scrollTop: number;
  isCategoryVisible: boolean;
  /** Whether topOffset is final; unmeasured sections above shift it. */
  positioned: boolean;
}) {
  const isEmojiHidden = useIsEmojiHidden();
  const lazyLoadEmojis = useLazyLoadEmojisConfig();
  const emojiStyle = useEmojiStyleConfig();
  const [activeSkinTone] = useActiveSkinToneState();
  const isEmojiDisallowed = useIsEmojiDisallowed();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const showVariations = !useSkinTonesDisabledConfig();
  const BodyRef = useBodyRef();
  const requestNativeProbe = useRequestNativeProbe();
  // Native glyphs checked exactly: the cells this pass renders (visible
  // rows plus virtualization's margin rows), nothing else.
  const probe: string[] = [];

  let virtualizedCounter = 0;

  // A section shows each rendered emoji once. Recents can hold the same
  // emoji under two tones (e.g. neutral and medium); the active tone
  // renders both as one identity, which must not be listed or keyed twice.
  const rendered = new Set<string>();
  const emojisToPush = categoryEmojis.filter((emoji) => {
    const isDisallowed = isEmojiDisallowed(emoji);
    const { hidden } = isEmojiHidden(emoji);

    if (hidden || isDisallowed) {
      return false;
    }
    const unified = emojiUnified(emoji, activeSkinTone);
    if (rendered.has(unified)) {
      return false;
    }
    rendered.add(unified);
    return true;
  });

  const dimensions = useCategoryHeight(emojisToPush.length);

  useEffect(() => {
    if (dimensions) {
      onHeightReady(dimensions.categoryHeight);
    }
  }, [dimensions, onHeightReady, emojisToPush.length]);

  const isVirtualized = (style: { top: number } | undefined) =>
    dimensions &&
    BodyRef.current &&
    shouldVirtualize({
      scrollTop,
      clientHeight: BodyRef.current?.clientHeight ?? 0,
      topOffset,
      style,
      dimensions,
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
        getEmojiUrl,
      );
      return accumulator;
    }

    if (!isCategoryVisible) {
      virtualizedCounter++;
      return accumulator;
    }

    // Wait for layout: an unmeasured pass renders a whole category, and
    // while sections above are unmeasured this one renders off-screen
    // cells as if it were at the top.
    if (dimensions && positioned) probe.push(unified);
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
          position: 'absolute',
        }}
        index={index}
        // Grid semantics (issue #508): each emoji is a cell of its
        // category row; native button activation is kept.
        role="gridcell"
      />,
    );
    return accumulator;
  }, [] as ReactNode[]);

  // Every commit: requests for already-checked glyphs are free.
  useEffect(() => requestNativeProbe(probe));

  return {
    virtualizedCounter,
    emojis,
    dimensions,
    emojiCount: emojisToPush.length,
  };
}
