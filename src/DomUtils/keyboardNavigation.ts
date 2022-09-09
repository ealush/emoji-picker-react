import { ClassNames } from './classNames';
import { focusElement } from './focusElement';

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

export function focusFirstVisibleEmoji(parent: HTMLElement | null) {
  focusElement(firstVisibleEmoji(parent));
}

export function firstVisibleEmoji(parent: HTMLElement | null) {
  if (!parent) {
    return null;
  }

  const emoji = parent.querySelector(
    `.${ClassNames.emoji}.${ClassNames.visible}`
  );

  if (!emoji) {
    return null;
  }

  return emoji as HTMLElement;
}

export function focusLastVisibleEmoji(parent: HTMLElement | null) {
  focusElement(lastVisibleEmoji(parent));
}

export function focusNextVisibleEmoji(element: HTMLElement | null) {
  if (!element) {
    return;
  }

  const next = nextVisibleEmoji(element);

  if (!next) {
    return focusFirstVisibleEmoji(nextCategory(element));
  }

  next.focus();
}

function closestCategory(element: HTMLElement) {
  return element.closest(`.${ClassNames.category}`) as HTMLElement;
}

function nextCategory(element: HTMLElement): HTMLElement | null {
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

function isHidden(element: HTMLElement | null) {
  if (!element) return true;

  return element.classList.contains(ClassNames.hidden);
}

export function focusPrevVisibleEmoji(element: HTMLElement | null) {
  if (!element) {
    return;
  }

  const prev = prevVisibleEmoji(element);

  if (!prev) {
    return focusLastVisibleEmoji(prevCategory(element));
  }

  prev.focus();
}

function prevCategory(element: HTMLElement): HTMLElement | null {
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

export function nextVisibleEmoji(element: HTMLElement): HTMLElement | null {
  const next = element.nextElementSibling as HTMLElement;

  if (!next) {
    return firstVisibleEmoji(nextCategory(element));
  }

  if (!next.classList.contains(ClassNames.visible)) {
    return nextVisibleEmoji(next);
  }

  return next;
}

export function prevVisibleEmoji(element: HTMLElement): HTMLElement | null {
  const prev = element.previousElementSibling as HTMLElement;

  if (!prev) {
    return lastVisibleEmoji(prevCategory(element));
  }

  if (!prev.classList.contains(ClassNames.visible)) {
    return prevVisibleEmoji(prev);
  }

  return prev;
}

function lastVisibleEmoji(element: HTMLElement | null): HTMLElement | null {
  if (!element) return null;

  const last = lastElementChild(element);

  if (!last) {
    return null;
  }

  if (!last.classList.contains(ClassNames.visible)) {
    return prevVisibleEmoji(last);
  }

  return last;
}

function lastElementChild(element: HTMLElement | null) {
  if (!element) return null;

  return element.lastElementChild as HTMLElement;
}
