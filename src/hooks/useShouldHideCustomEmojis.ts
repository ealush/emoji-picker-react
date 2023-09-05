import { useCustomEmojisConfig } from '../config/useConfig';

export function useShouldHideCustomEmojis() {
  const customCategoryConfig = useCustomEmojisConfig();

  if (!customCategoryConfig) {
    return false;
  }

  return customCategoryConfig.length === 0;
}
