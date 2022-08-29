import { emojiByUnified } from '../dataUtils/emojiSelectors';
import { DataEmoji } from '../dataUtils/DataTypes';

export function buttonFromEmoji(
  emojiElement: HTMLElement | null
): HTMLButtonElement | null {
  return emojiElement?.closest('button.epr-emoji') ?? null;
}

export function emojiFromElement(
  element: HTMLElement | null
): DataEmoji | undefined {
  const unified = originalUnifiedFromEmojiElement(element);

  if (!unified) {
    return;
  }
  return emojiByUnified(unified);
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

function elementOffsetTop(element: HTMLElement | null): number {
  return element?.offsetTop ?? 0;
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
