import { DataEmoji } from '../dataUtils/DataTypes';
import {
  emojiByUnified,
  unifiedWithoutSkinTone
} from '../dataUtils/emojiSelectors';

import { asSelectors, ClassNames } from './classNames';
import { firstVisibleElementInContainer } from './elementPositionInRow';

export type NullableElement = HTMLElement | null;

export const EmojiButtonSelector = `button${asSelectors(ClassNames.emoji)}`;
export const VisibleEmojiSelector = [
  EmojiButtonSelector,
  asSelectors(ClassNames.visible),
  `:not(${asSelectors(ClassNames.hidden)})`
].join('');

export function buttonFromTarget(
  emojiElement: NullableElement
): HTMLButtonElement | null {
  return emojiElement?.closest(EmojiButtonSelector) ?? null;
}

export function isEmojiButton(element: NullableElement): boolean {
  if (!element) {
    return false;
  }

  return element.matches(EmojiButtonSelector);
}

export function emojiFromElement(
  element: NullableElement
): [DataEmoji, string] | [] {
  const originalUnified = originalUnifiedFromEmojiElement(element);
  const unified = unifiedFromEmojiElement(element);

  if (!originalUnified) {
    return [];
  }

  const emoji = emojiByUnified(unified ?? originalUnified);

  if (!emoji) {
    return [];
  }

  return [emoji, unified as string];
}

export function isEmojiElement(element: NullableElement): boolean {
  return Boolean(
    element?.matches(EmojiButtonSelector) ||
      element?.parentElement?.matches(EmojiButtonSelector)
  );
}

export function categoryLabelFromCategory(
  category: NullableElement
): NullableElement {
  return category?.querySelector(asSelectors(ClassNames.label)) ?? null;
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
  if (!element) {
    return 0;
  }

  const button = buttonFromTarget(element);
  const category = closestCategory(button);

  // compensate for the label height
  const labelHeight = categoryLabelHeight(category);

  return elementOffsetTop(button) + elementOffsetTop(category) + labelHeight;
}

export function categoryLabelHeight(category: NullableElement): number {
  if (!category) {
    return 0;
  }

  const categoryWithoutLabel = category.querySelector(
    asSelectors(ClassNames.categoryContent)
  );

  return (
    (category?.clientHeight ?? 0) - (categoryWithoutLabel?.clientHeight ?? 0)
  );
}

export function isEmojiBehindLabel(emoji: NullableElement): boolean {
  if (!emoji) {
    return false;
  }

  return (
    emojiDistanceFromScrollTop(emoji) <
    categoryLabelHeight(closestCategory(emoji))
  );
}

export function queryScrollBody(root: NullableElement): NullableElement {
  if (!root) return null;

  return root.matches(asSelectors(ClassNames.scrollBody))
    ? root
    : root.querySelector(asSelectors(ClassNames.scrollBody));
}

export function emojiDistanceFromScrollTop(emoji: NullableElement): number {
  if (!emoji) {
    return 0;
  }

  return emojiTrueOffsetTop(emoji) - (closestScrollBody(emoji)?.scrollTop ?? 0);
}

export function closestScrollBody(element: NullableElement): NullableElement {
  if (!element) {
    return null;
  }

  return element.closest(asSelectors(ClassNames.scrollBody)) ?? null;
}

export function emojiTruOffsetLeft(element: NullableElement): number {
  const button = buttonFromTarget(element);
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
  return elementDataSetKey(buttonFromTarget(emoji), 'unified') ?? null;
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

export function allUnifiedFromEmojiElement(
  emoji: NullableElement
): { unified: string | null; originalUnified: string | null } {
  if (!emoji) {
    return {
      unified: null,
      originalUnified: null
    };
  }

  return {
    unified: unifiedFromEmojiElement(emoji),
    originalUnified: originalUnifiedFromEmojiElement(emoji)
  };
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

  const allEmojis = allVisibleEmojis(element);
  const [last] = allEmojis.slice(-1);
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

  const allEmojis = allVisibleEmojis(parent);

  return firstVisibleElementInContainer(parent, allEmojis, 0.1);
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
  return element.closest(asSelectors(ClassNames.category)) as HTMLElement;
}

export function closestCategoryContent(element: NullableElement) {
  if (!element) {
    return null;
  }
  return element.closest(
    asSelectors(ClassNames.categoryContent)
  ) as HTMLElement;
}
