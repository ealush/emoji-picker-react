import { useHideUnicodeCharacters } from "../config/useConfig";

export function useIsUnicodeHidden() {
    const hideUnicodeCharacters = useHideUnicodeCharacters();
    return (emojiUnified: string) => hideUnicodeCharacters.includes(emojiUnified);
  }