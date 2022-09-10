import { NullableElement } from './selectors';

export function focusElement(element: NullableElement) {
  if (!element) {
    return;
  }

  requestAnimationFrame(() => {
    element.focus();
  });
}
