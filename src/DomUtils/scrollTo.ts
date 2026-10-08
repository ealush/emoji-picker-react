import { useCallback } from 'react';

import { useBodyRef } from '../components/context/ElementRefContext';

import { asSelectors, ClassNames } from './classNames';
import {
  categoryLabelHeight,
  closestCategory,
  closestScrollBody,
  emojiDistanceFromScrollTop,
  isEmojiBehindLabel,
  NullableElement,
  queryScrollBody,
} from './selectors';

export function scrollTo(
  root: NullableElement,
  top: number | (() => number) = 0,
  shouldScroll?: () => boolean,
) {
  const $eprBody = queryScrollBody(root);

  if (!$eprBody) {
    return;
  }

  requestAnimationFrame(() => {
    if (!shouldScroll || shouldScroll())
      $eprBody.scrollTop = typeof top === 'function' ? top() : top;
  });
}

export function useScrollTo() {
  const BodyRef = useBodyRef();

  return useCallback(
    (top: number) => {
      requestAnimationFrame(() => {
        if (BodyRef.current) {
          BodyRef.current.scrollTop = top;
        }
      });
    },
    [BodyRef],
  );
}

export function scrollEmojiAboveLabel(
  emoji: NullableElement,
  shouldScroll?: () => boolean,
) {
  if (!emoji || !isEmojiBehindLabel(emoji)) {
    return;
  }

  if (emoji.closest(asSelectors(ClassNames.variationPicker))) {
    return;
  }

  const scrollBody = closestScrollBody(emoji);
  const by = emojiDistanceFromScrollTop(emoji);
  if (scrollBody)
    scrollTo(
      scrollBody,
      () =>
        scrollBody.scrollTop - categoryLabelHeight(closestCategory(emoji)) + by,
      shouldScroll,
    );
}
