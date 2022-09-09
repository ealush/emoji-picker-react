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

export function nextVisibleEmoji(element: HTMLElement) {
  const next = element.nextElementSibling as HTMLElement;

  if (!next) {
    return;
  }

  if (!next.classList.contains(ClassNames.visible)) {
    return;
  }

  return next;
}

export function prevVisibleEmoji(element: HTMLElement) {
  const prev = element.previousElementSibling as HTMLElement;

  if (!prev) {
    return;
  }

  if (!prev.classList.contains(ClassNames.visible)) {
    return;
  }

  return prev;
}
