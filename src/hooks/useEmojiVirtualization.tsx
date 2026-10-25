import { ReactNode, useEffect } from 'react';
import * as React from 'react';

import { useBodyRef } from '../components/context/ElementRefContext';
import {
  useActiveSkinToneState,
  useRequestNativeProbe,
  useSearchTermState,
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
import { emojiNames } from '../dataUtils/emojiSelectors';
import { emojiUnified } from '../dataUtils/emojiUtils';
import { EmojiStyle } from '../types/exposedTypes';
import {
  getEmojiPositionStyle,
  shouldVirtualize,
  isJustBelowViewport,
} from '../virtualization/virtualizationHelpers';

import { preloadEmoji } from './preloadEmoji';
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
  mounted,
}: {
  categoryEmojis: DataEmojis;
  topOffset: number;
  onHeightReady: (height: number) => void;
  scrollTop: number;
  isCategoryVisible: boolean;
  /** Whether topOffset is final; unmeasured sections above shift it. */
  positioned: boolean;
  /** Whether the list's ref is attached, so sections can measure. */
  mounted: boolean;
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
  const preloads: DataEmoji[] = [];
  const [committed, setCommitted] = React.useState(false);

  // A section shows each rendered emoji once. Recents can hold the same
  // emoji under two tones (e.g. neutral and medium); the active tone
  // renders both as one identity, which must not be listed or keyed twice.
  const [searchTerm] = useSearchTermState();
  const emojisToPush = React.useMemo(() => {
    const rendered = new Set<string>();
    const shown = categoryEmojis.filter((emoji) => {
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
    // Within a section, the best matches come first. Sections keep their
    // order, and ties keep the section's own order (the sort is stable).
    return searchTerm
      ? shown
          .map((emoji) => [matchRank(emoji, searchTerm), emoji] as const)
          .sort((left, right) => left[0] - right[0])
          .map(([, emoji]) => emoji)
      : shown;
  }, [
    categoryEmojis,
    activeSkinTone,
    isEmojiHidden,
    isEmojiDisallowed,
    searchTerm,
  ]);

  const dimensions = useCategoryHeight(
    emojisToPush.length,
    isCategoryVisible && positioned,
    mounted,
  );

  // Guarantee a render even when a hidden picker has no measurement cell.
  // A passive update avoids flushing all observer effects before first paint.
  useEffect(() => {
    if (!dimensions) setCommitted(true);
  }, [dimensions]);

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

  const needsPreload = (style: { top: number } | undefined) =>
    emojiStyle !== EmojiStyle.NATIVE &&
    dimensions &&
    style &&
    isJustBelowViewport(
      topOffset + style.top,
      scrollTop + (BodyRef.current?.clientHeight ?? 0),
      dimensions.emojiSize,
    );

  const waitingForLayout =
    (!committed && !dimensions) ||
    ((!dimensions || !positioned) && BodyRef.current?.clientWidth);

  // MeasureEmoji supplies geometry before cells are built. Layout-free
  // environments can render after the first commit without measurements.
  const emojis = waitingForLayout
    ? []
    : emojisToPush.reduce((accumulator, emoji, index) => {
        const style = getEmojiPositionStyle(dimensions, index);

        if (isVirtualized(style)) {
          if (needsPreload(style)) preloads.push(emoji);
          return accumulator;
        }

        if (!isCategoryVisible) {
          return accumulator;
        }

        const unified = emojiUnified(emoji, activeSkinTone);
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
  // Only the image a nearby cell will render is fetched: every skin tone of
  // every nearby cell is hundreds of requests per scroll and long frames on
  // slow devices. Focusing a cell (useOnFocus) fetches its variations.
  useEffect(() => {
    preloads.forEach((emoji) =>
      preloadEmoji(
        getEmojiUrl,
        emoji,
        emojiStyle,
        emojiUnified(emoji, activeSkinTone),
      ),
    );
  });

  return {
    virtualizedCounter: emojisToPush.length - emojis.length,
    emojis,
    dimensions,
    emojiCount: emojisToPush.length,
  };
}

// 0: the name is the query; 1: the name starts with it; 2: a keyword is
// the query; 3: a word of the name starts with it; 4: any other match.
function matchRank(emoji: DataEmoji, query: string): number {
  const names = emojiNames(emoji).map((name) => name.toLowerCase());
  const name = names[names.length - 1] || '';
  if (name === query) return 0;
  if (name.startsWith(query)) return 1;
  if (names.includes(query)) return 2;
  // Hyphens and other joiners separate words too ("t-rex").
  return (' ' + name).replace(/[-_.:/]/g, ' ').includes(' ' + query) ? 3 : 4;
}
