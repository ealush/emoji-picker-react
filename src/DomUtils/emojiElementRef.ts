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

export function hideEmojiOnSearch(unified: string): void {
  hideElementOnSearch(getEmojiRef(unified).current);
}

export function showEmojiOnSearch(unified: string): void {
  showElementOnSearch(getEmojiRef(unified).current);
}

export function hideElementOnSearch(element: HTMLElement | null): void {
  if (!element) return;
  element.classList.add(ClassNames.hiddenOnSearch);
  element.classList.remove(ClassNames.visible);
}

export function showElementOnSearch(element: HTMLElement | null): void {
  if (!element) return;
  element.classList.remove(ClassNames.hiddenOnSearch);
  element.classList.add(ClassNames.visible);
}
