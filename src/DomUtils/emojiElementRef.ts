import { ClassNames } from './classNames';
import { NullableElement } from './selectors';

export type EmojiRef = { current: NullableElement };

export const emojiRef: Record<string, EmojiRef> = {};

export function getEmojiRef(unified: string): EmojiRef {
  emojiRef[unified] = emojiRef[unified] || { current: null };
  return emojiRef[unified];
}

export function iterateEmojiRef(
  callback: (ref: HTMLElement, unified: string) => void
): void {
  for (const unified in emojiRef) {
    if (!emojiRef[unified] || emojiRef[unified].current === null) {
      continue;
    }

    callback(emojiRef[unified].current as HTMLElement, unified);
  }
}

export function hideEmoji(unified: string): void {
  hideElement(getEmojiRef(unified).current);
}

export function showEmoji(unified: string): void {
  showElement(getEmojiRef(unified).current);
}

export function hideElement(element: NullableElement): void {
  if (!element) return;
  element.classList.add(ClassNames.hidden);
  element.classList.remove(ClassNames.visible);
}

export function showElement(element: NullableElement): void {
  if (!element) return;
  element.classList.remove(ClassNames.hidden);
  element.classList.add(ClassNames.visible);
}
