import { NullableElement } from './selectors';

export function lastElementChild(element: NullableElement) {
  if (!element) return null;

  return element.lastElementChild as HTMLElement;
}
