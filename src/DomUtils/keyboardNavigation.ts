import {
  elementCountInRow,
  elementIndexInRow,
  getElementInNextRow,
  getElementInPrevRow,
  getElementInRow,
  hasNextRow,
  rowNumber
} from './elementPositionInRow';
import { focusElement } from './focusElement';
import { scrollEmojiAboveLabel } from './scrollTo';
import {
  allVisibleEmojis,
  closestCategory,
  firstVisibleEmoji,
  lastVisibleEmoji,
  nextCategory,
  nextVisibleEmoji,
  NullableElement,
  prevCategory,
  prevVisibleEmoji,
  closestCategoryContent
} from './selectors';

export function focusFirstVisibleEmoji(parent: NullableElement) {
  const emoji = firstVisibleEmoji(parent);
  focusElement(emoji);
  scrollEmojiAboveLabel(emoji);
}

export function focusAndClickFirstVisibleEmoji(parent: NullableElement) {
  const firstEmoji = firstVisibleEmoji(parent);

  focusElement(firstEmoji);
  firstEmoji?.click();
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
  scrollEmojiAboveLabel(next);
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
  scrollEmojiAboveLabel(prev);
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
  scrollEmojiAboveLabel(prev);
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

  const categoryContent = closestCategoryContent(element);
  const category = closestCategory(categoryContent);
  const indexInRow = elementIndexInRow(categoryContent, element);
  const row = rowNumber(categoryContent, element);
  const countInRow = elementCountInRow(categoryContent, element);

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
    allVisibleEmojis(categoryContent),
    row,
    countInRow,
    indexInRow
  );
}

function visibleEmojiOneRowDown(element: HTMLElement) {
  if (!element) {
    return null;
  }

  const categoryContent = closestCategoryContent(element);
  const category = closestCategory(categoryContent);
  const indexInRow = elementIndexInRow(categoryContent, element);
  const row = rowNumber(categoryContent, element);
  const countInRow = elementCountInRow(categoryContent, element);
  if (!hasNextRow(categoryContent, element)) {
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
    allVisibleEmojis(categoryContent),
    row,
    countInRow,
    indexInRow
  );

  return itemInNextRow;
}
