import { useUnicodeToHide } from "../config/useConfig";

export function useIsUnicodeHidden() {
    const unicodeToHide = useUnicodeToHide();
    return (emojiUnified: string) => unicodeToHide.has(emojiUnified);
  }
