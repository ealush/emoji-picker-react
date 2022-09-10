import {
  elementCountInRow,
  elementIndexInRow,
  firstVisibleElementInContainer,
  getElementInNextRow,
  getElementInPrevRow,
  getElementInRow,
  hasNextRow,
  rowNumber
} from './elementPositionInRow';
import { focusElement } from './focusElement';
import {
  allVisibleEmojis,
  closestCategory,
  lastVisibleEmoji,
  nextCategory,
  nextVisibleEmoji,
  NullableElement,
  prevCategory,
  prevVisibleEmoji
} from './selectors';

export function focusFirstVisibleEmoji(parent: NullableElement) {
  const allEmojis = allVisibleEmojis(parent);
  focusElement(firstVisibleElementInContainer(parent, allEmojis));
}

export function focusLastVisibleEmoji(parent: NullableElement) {
  focusElement(lastVisibleEmoji(parent));
}

export function focusNextVisibleEmoji(element: NullableElement) {
  if (!element) {
    return;
  }

  const next = nextVisibleEmoji(element);

  if (!next) {
    return focusFirstVisibleEmoji(nextCategory(element));
  }

  focusElement(next);
}

export function focusPrevVisibleEmoji(element: NullableElement) {
  if (!element) {
    return;
  }

  const prev = prevVisibleEmoji(element);

  if (!prev) {
    return focusLastVisibleEmoji(prevCategory(element));
  }

  focusElement(prev);
}

export function focusVisibleEmojiOneRowUp(
  element: NullableElement,
  exitUp: () => void
) {
  if (!element) {
    return;
  }

  const prev = visibleEmojiOneRowUp(element);

  if (!prev) {
    return exitUp();
  }

  focusElement(prev);
}

export function focusVisibleEmojiOneRowDown(element: NullableElement) {
  if (!element) {
    return;
  }

  const next = visibleEmojiOneRowDown(element);

  return focusElement(next);
}

function visibleEmojiOneRowUp(element: HTMLElement) {
  if (!element) {
    return null;
  }

  const category = closestCategory(element);
  const indexInRow = elementIndexInRow(category, element);
  const row = rowNumber(category, element);
  const countInRow = elementCountInRow(category, element);

  if (row === 0) {
    const prevVisibleCategory = prevCategory(category);

    if (!prevVisibleCategory) {
      return null;
    }

    return getElementInRow(
      allVisibleEmojis(prevVisibleCategory),
      -1, // last row
      countInRow,
      indexInRow
    );
  }

  return getElementInPrevRow(
    allVisibleEmojis(category),
    row,
    countInRow,
    indexInRow
  );
}

function visibleEmojiOneRowDown(element: HTMLElement) {
  if (!element) {
    return null;
  }

  const category = closestCategory(element);
  const indexInRow = elementIndexInRow(category, element);
  const row = rowNumber(category, element);
  const countInRow = elementCountInRow(category, element);

  if (!hasNextRow(category, element)) {
    const nextVisibleCategory = nextCategory(category);

    if (!nextVisibleCategory) {
      return null;
    }

    return getElementInRow(
      allVisibleEmojis(nextVisibleCategory),
      0,
      countInRow,
      indexInRow
    );
  }

  const itemInNextRow = getElementInNextRow(
    allVisibleEmojis(category),
    row,
    countInRow,
    indexInRow
  );

  return itemInNextRow;
}
