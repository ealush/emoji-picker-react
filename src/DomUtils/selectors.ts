export function buttonFromEmoji(
  emojiElement: HTMLElement | null
): HTMLButtonElement | null {
  return emojiElement?.closest('button.epr-emoji') ?? null;
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
