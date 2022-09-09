export function getActiveElement() {
  return document.activeElement as HTMLElement | null;
}

export function focusPrevElementSibling(element: HTMLElement | null) {
  if (!element) return;

  const prev = element.previousElementSibling as HTMLElement;

  if (!prev) {
    return;
  }

  prev.focus();
}

export function focusNextElementSibling(element: HTMLElement | null) {
  if (!element) return;

  const next = element.nextElementSibling as HTMLElement;

  if (!next) {
    return;
  }

  next.focus();
}

export function focusFirstElementChild(element: HTMLElement | null) {
  if (!element) return;

  const first = element.firstElementChild as HTMLElement;

  if (!first) {
    return;
  }

  first.focus();
}

export function hasNextElementSibling(element: HTMLElement) {
  return !!element.nextElementSibling;
}

export function hasPrevElementSibling(element: HTMLElement) {
  return !!element.previousElementSibling;
}
