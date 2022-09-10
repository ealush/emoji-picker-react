import { NullableElement } from './selectors';

export function focusElement(element: NullableElement) {
  if (!element) {
    return;
  }

  requestAnimationFrame(() => {
    element.focus();
  });
}

export function focusPrevElementSibling(element: NullableElement) {
  if (!element) return;

  const prev = element.previousElementSibling as HTMLElement;

  focusElement(prev);
}

export function focusNextElementSibling(element: NullableElement) {
  if (!element) return;

  const next = element.nextElementSibling as HTMLElement;

  focusElement(next);
}

export function focusFirstElementChild(element: NullableElement) {
  if (!element) return;

  const first = element.firstElementChild as HTMLElement;

  focusElement(first);
}
