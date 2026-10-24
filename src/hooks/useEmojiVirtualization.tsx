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
  useVariationsDisabledConfig,
} from '../config/useConfig';
import { DataEmoji, DataEmojis } from '../dataUtils/DataTypes';
import { emojiUnified } from '../dataUtils/emojiUtils';
import {
  getEmojiPositionStyle,
  shouldVirtualize,
} from '../virtualization/virtualizationHelpers';

import { preloadEmojiIfNeeded } from './preloadEmoji';
import { useCategoryHeight } from './useCategoryHeight';
import { useIsEmojiDisallowed } from './useDisallowedEmojis';
import { useIsEmojiHidden } from './useIsEmojiHidden';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

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
  const skinTonesDisabled = useSkinTonesDisabledConfig();
  const variationsDisabled = useVariationsDisabledConfig();
  const showVariations = !skinTonesDisabled && !variationsDisabled;
  const BodyRef = useBodyRef();
  const requestNativeProbe = useRequestNativeProbe();
  // Native glyphs checked exactly: the cells this pass renders (visible
  // rows plus virtualization's margin rows), nothing else.
  const probe: string[] = [];
  const preloads: {
    emoji: DataEmoji;
    unified: string;
    style: { top: number } | undefined;
  }[] = [];

  let virtualizedCounter = 0;

  // A section shows each rendered emoji once. Recents can hold the same
  // emoji under two tones (e.g. neutral and medium); the active tone
  // renders both as one identity, which must not be listed or keyed twice.
  const emojisToPush = React.useMemo(() => {
    const rendered = new Set<string>();
    return categoryEmojis.filter((emoji) => {
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
  }, [categoryEmojis, activeSkinTone, isEmojiHidden, isEmojiDisallowed]);

  const dimensions = useCategoryHeight(emojisToPush.length);

  useIsomorphicLayoutEffect(() => {
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
    // MeasureEmoji provides the cell geometry. Until offsets are final,
    // rendering an entire category only to discard it delays first paint.
    // Layout-free unit tests have no measurements to wait for.
    if ((!dimensions || !positioned) && BodyRef.current?.clientWidth) {
      virtualizedCounter++;
      return accumulator;
    }
    const unified = emojiUnified(emoji, activeSkinTone);
    const style = getEmojiPositionStyle(dimensions, index);

    if (isVirtualized(style)) {
      virtualizedCounter++;
      preloads.push({ emoji, unified, style });
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
  // Image requests belong to committed work, never an abandoned render.
  // The proximity and cache checks run synchronously, without per-cell timers.
  useEffect(() => {
    preloads.forEach(({ emoji, unified, style }) =>
      preloadEmojiIfNeeded(
        emoji,
        emojiStyle,
        scrollTop,
        BodyRef.current?.clientHeight ?? 0,
        topOffset,
        style,
        dimensions,
        getEmojiUrl,
        variationsDisabled ? unified : undefined,
      ),
    );
  });

  return {
    virtualizedCounter,
    emojis,
    dimensions,
    emojiCount: emojisToPush.length,
  };
}
