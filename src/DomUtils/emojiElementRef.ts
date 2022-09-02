export type EmojiRef = { current: null | HTMLElement };

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
