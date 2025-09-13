import { elementCountInRow } from './elementPositionInRow';
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
  const countInRow = elementCountInRow(categoryContent, element);

  const emojisInCurrentCategory = allVisibleEmojis(category);
  const currentEmojiIndex = emojisInCurrentCategory.indexOf(element);
  const indexInRow = currentEmojiIndex % countInRow;

  if (currentEmojiIndex === -1) {
    return null;
  }

  if (emojisInCurrentCategory[currentEmojiIndex - countInRow]) {
    return emojisInCurrentCategory[currentEmojiIndex - countInRow];
  }

  const prevVisibleCategory = prevCategory(category);

  if (!prevVisibleCategory) {
    return null;
  }

  const allPrevEmojis = allVisibleEmojis(prevVisibleCategory);

  // if there is an emoji in the same index of `indexInRow` in the previous category, return it
  // for this we need to find the last emoji in the previous category that shares the same indexInRow
  // this is by using the % operator to find the last emoji that matches

  const lastIndexInRow = (allPrevEmojis.length % countInRow) - 1;

  if (indexInRow > lastIndexInRow) {
    return allPrevEmojis.at(-1);
  }

  // otherwise, return the last emoji that shares the same indexInRow

  for (let i = allPrevEmojis.length - 1; i >= 0; i--) {
    if (i % countInRow === indexInRow) {
      return allPrevEmojis[i];
    }
  }

  return allPrevEmojis.at(-1);
}

function visibleEmojiOneRowDown(element: HTMLElement) {
  if (!element) {
    return null;
  }

  const categoryContent = closestCategoryContent(element);
  const category = closestCategory(categoryContent);
  const countInRow = elementCountInRow(categoryContent, element);

  const emojisInCurrentCategory = allVisibleEmojis(category);
  const currentEmojiIndex = emojisInCurrentCategory.indexOf(element);

  if (currentEmojiIndex === -1) {
    return null;
  }

  // the remainder until the end of the row
  const remainder = countInRow - (currentEmojiIndex % countInRow) - 1;
  const firstInNextRow = currentEmojiIndex + remainder + 1;

  if (emojisInCurrentCategory[firstInNextRow]) {
    // if we have a next row, search in the next row for the last available emoji
    for (let p = currentEmojiIndex + countInRow; p % countInRow >= 0; p--) {
      if (emojisInCurrentCategory[p]) {
        return emojisInCurrentCategory[p];
      }
    }
  }

  const indexInRow = currentEmojiIndex % countInRow;

  const nextVisibleCategory = nextCategory(category);
  const emojisInNextCategory = allVisibleEmojis(nextVisibleCategory);

  if (emojisInNextCategory[indexInRow]) {
    return emojisInNextCategory[indexInRow];
  }

  return emojisInNextCategory.at(0) ?? null;
}
