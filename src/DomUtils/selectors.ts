import { DataEmoji } from '../dataUtils/DataTypes';
import { emojiByUnified } from '../dataUtils/emojiSelectors';

export function buttonFromEmoji(
  emojiElement: HTMLElement | null
): HTMLButtonElement | null {
  return emojiElement?.closest('button.epr-emoji') ?? null;
}

export function emojiFromElement(
  element: HTMLElement | null
): [emoji: DataEmoji, unified: string] | [] {
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

export function isEmojiElement(element: HTMLElement | null): boolean {
  return Boolean(
    element?.matches('button.epr-emoji') ||
      element?.parentElement?.matches('button.epr-emoji')
  );
}

export function closestCategory(
  element: HTMLElement | null
): HTMLElement | null {
  return element?.closest('.epr-emoji-category') ?? null;
}

export function categoryLabelFromCategory(
  category: HTMLElement | null
): HTMLElement | null {
  return category?.querySelector('.epr-emoji-category-label') ?? null;
}

export function closestCategoryLabel(
  element: null | HTMLElement
): HTMLElement | null {
  const category = closestCategory(element);
  return categoryLabelFromCategory(category);
}

export function elementHeight(element: HTMLElement | null): number {
  return element?.clientHeight ?? 0;
}

export function emojiTrueOffsetTop(element: HTMLElement | null): number {
  const button = buttonFromEmoji(element);
  const category = closestCategory(button);

  return elementOffsetTop(button) + elementOffsetTop(category);
}
export function emojiTruOffsetLeft(element: HTMLElement | null): number {
  const button = buttonFromEmoji(element);
  const category = closestCategory(button);

  return elementOffsetLeft(button) + elementOffsetLeft(category);
}

function elementOffsetTop(element: HTMLElement | null): number {
  return element?.offsetTop ?? 0;
}

function elementOffsetLeft(element: HTMLElement | null): number {
  return element?.offsetLeft ?? 0;
}

export function unifiedFromEmojiElement(
  emoji: HTMLElement | null
): string | null {
  return elementDataSetKey(buttonFromEmoji(emoji), 'unified') ?? null;
}

export function originalUnifiedFromEmojiElement(
  emoji: HTMLElement | null
): string | null {
  return elementDataSetKey(buttonFromEmoji(emoji), 'original') ?? null;
}

function elementDataSetKey(
  element: HTMLElement | null,
  key: string
): string | null {
  return elementDataSet(element)[key] ?? null;
}

function elementDataSet(element: HTMLElement | null): DOMStringMap {
  return element?.dataset ?? {};
}
