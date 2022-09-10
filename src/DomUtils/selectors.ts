import { DataEmoji } from '../dataUtils/DataTypes';
import {
  emojiByUnified,
  unifiedWithoutSkinTone
} from '../dataUtils/emojiSelectors';
import { ClassNames } from './classNames';
import { lastElementChild } from './lastElementChild';

export type NullableElement = HTMLElement | null;

export const VisibleEmojiSelector = `.${ClassNames.emoji}.${ClassNames.visible}:not(.${ClassNames.hidden})`;

export function buttonFromEmoji(
  emojiElement: NullableElement
): HTMLButtonElement | null {
  return emojiElement?.closest('button.epr-emoji') ?? null;
}

export function emojiFromElement(
  element: NullableElement
): [DataEmoji, string] | [] {
  const originalUnified = originalUnifiedFromEmojiElement(element);
  const unified = unifiedFromEmojiElement(element);

  if (!originalUnified) {
    return [];
  }

  const emoji = emojiByUnified(originalUnified);

  if (!emoji) {
    return [];
  }

  return [emoji, unified as string];
}

export function isEmojiElement(element: NullableElement): boolean {
  return Boolean(
    element?.matches('button.epr-emoji') ||
      element?.parentElement?.matches('button.epr-emoji')
  );
}

export function categoryLabelFromCategory(
  category: NullableElement
): NullableElement {
  return category?.querySelector('.epr-emoji-category-label') ?? null;
}

export function closestCategoryLabel(
  element: NullableElement
): NullableElement {
  const category = closestCategory(element);
  return categoryLabelFromCategory(category);
}

export function elementHeight(element: NullableElement): number {
  return element?.clientHeight ?? 0;
}

export function emojiTrueOffsetTop(element: NullableElement): number {
  const button = buttonFromEmoji(element);
  const category = closestCategory(button);

  return elementOffsetTop(button) + elementOffsetTop(category);
}
export function emojiTruOffsetLeft(element: NullableElement): number {
  const button = buttonFromEmoji(element);
  const category = closestCategory(button);

  return elementOffsetLeft(button) + elementOffsetLeft(category);
}

function elementOffsetTop(element: NullableElement): number {
  return element?.offsetTop ?? 0;
}

function elementOffsetLeft(element: NullableElement): number {
  return element?.offsetLeft ?? 0;
}

export function unifiedFromEmojiElement(emoji: NullableElement): string | null {
  return elementDataSetKey(buttonFromEmoji(emoji), 'unified') ?? null;
}

export function originalUnifiedFromEmojiElement(
  emoji: NullableElement
): string | null {
  const unified = unifiedFromEmojiElement(emoji);

  if (unified) {
    return unifiedWithoutSkinTone(unified);
  }
  return null;
}

function elementDataSetKey(
  element: NullableElement,
  key: string
): string | null {
  return elementDataSet(element)[key] ?? null;
}

function elementDataSet(element: NullableElement): DOMStringMap {
  return element?.dataset ?? {};
}

export function isVisibleEmoji(element: HTMLElement) {
  return element.classList.contains(ClassNames.visible);
}

export function isHidden(element: NullableElement) {
  if (!element) return true;

  return element.classList.contains(ClassNames.hidden);
}

export function allVisibleEmojis(parent: NullableElement) {
  if (!parent) {
    return [];
  }

  return Array.from(
    parent.querySelectorAll(VisibleEmojiSelector)
  ) as HTMLElement[];
}

export function lastVisibleEmoji(element: NullableElement): NullableElement {
  if (!element) return null;

  const last = lastElementChild(element);

  if (!last) {
    return null;
  }

  if (!isVisibleEmoji(last)) {
    return prevVisibleEmoji(last);
  }

  return last;
}

export function nextVisibleEmoji(element: HTMLElement): NullableElement {
  const next = element.nextElementSibling as HTMLElement;

  if (!next) {
    return firstVisibleEmoji(nextCategory(element));
  }

  if (!isVisibleEmoji(next)) {
    return nextVisibleEmoji(next);
  }

  return next;
}

export function prevVisibleEmoji(element: HTMLElement): NullableElement {
  const prev = element.previousElementSibling as HTMLElement;

  if (!prev) {
    return lastVisibleEmoji(prevCategory(element));
  }

  if (!isVisibleEmoji(prev)) {
    return prevVisibleEmoji(prev);
  }

  return prev;
}

export function firstVisibleEmoji(parent: NullableElement) {
  if (!parent) {
    return null;
  }

  const emoji = parent.querySelector(VisibleEmojiSelector);

  return emoji as HTMLElement;
}

export function prevCategory(element: NullableElement): NullableElement {
  const category = closestCategory(element);

  if (!category) {
    return null;
  }

  const prev = category.previousElementSibling as HTMLElement;

  if (!prev) {
    return null;
  }

  if (isHidden(prev)) {
    return prevCategory(prev);
  }

  return prev;
}

export function nextCategory(element: NullableElement): NullableElement {
  const category = closestCategory(element);

  if (!category) {
    return null;
  }

  const next = category.nextElementSibling as HTMLElement;

  if (!next) {
    return null;
  }

  if (isHidden(next)) {
    return nextCategory(next);
  }

  return next;
}

export function closestCategory(element: NullableElement) {
  if (!element) {
    return null;
  }
  return element.closest(`.${ClassNames.category}`) as HTMLElement;
}
