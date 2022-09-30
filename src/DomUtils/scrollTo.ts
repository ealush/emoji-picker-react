import { useCallback } from 'react';

import { useBodyRef } from '../components/context/ElementRefContext';

import {
  categoryLabelHeight,
  closestCategory,
  closestScrollBody,
  emojiDistanceFromScrollTop,
  isEmojiBehindLabel,
  NullableElement,
  queryScrollBody
} from './selectors';

export function scrollTo(root: NullableElement, top: number = 0) {
  const $eprBody = queryScrollBody(root);

  if (!$eprBody) {
    return;
  }

  requestAnimationFrame(() => {
    $eprBody.scrollTop = top + 1;
  });
}

export function scrollBy(root: NullableElement, by: number): void {
  const $eprBody = queryScrollBody(root);

  if (!$eprBody) {
    return;
  }

  requestAnimationFrame(() => {
    $eprBody.scrollTop = $eprBody.scrollTop + by;
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
    [BodyRef]
  );
}

export function scrollEmojiAboveLabel(emoji: NullableElement) {
  if (!isEmojiBehindLabel(emoji)) {
    return;
  }

  const scrollBody = closestScrollBody(emoji);
  const by = emojiDistanceFromScrollTop(emoji);
  scrollBy(scrollBody, -(categoryLabelHeight(closestCategory(emoji)) - by));
}
