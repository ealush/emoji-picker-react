import { NullableElement } from './selectors';

export function detectEmojyPartiallyBelowFold(
  button: HTMLButtonElement,
  bodyRef: NullableElement
): number {
  if (!button || !bodyRef) {
    return 0;
  }

  const buttonRect = button.getBoundingClientRect();
  const bodyRect = bodyRef.getBoundingClientRect();

  // If the element is obscured by at least half of its size
  return bodyRect.height - (buttonRect.y - bodyRect.y);
}
