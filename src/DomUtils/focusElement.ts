import { NullableElement } from './selectors';

export function focusElement(
  element: NullableElement,
  shouldFocus?: () => boolean,
) {
  if (!element) {
    return;
  }

  requestAnimationFrame(() => {
    // Rechecked here rather than at call time: focus may have moved in the
    // meantime (e.g. hover scheduled focus, then the user tabbed out).
    if (shouldFocus && !shouldFocus()) {
      return;
    }
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
