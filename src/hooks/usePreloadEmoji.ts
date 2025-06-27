import { useEffect } from 'react';

import { CategoryConfig } from '../config/categoryConfig';
import { useEmojiStyleConfig, useGetEmojiUrlConfig, useLazyLoadEmojisConfig } from '../config/useConfig';
import { DataEmoji } from '../dataUtils/DataTypes';

import { preloadEmoji } from './preloadEmoji';

export function useEmojiPreload(categoriesMap: { emojis: DataEmoji[]; category: CategoryConfig }[], preloadRange: number = 20) {
  const emojiStyle = useEmojiStyleConfig();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const lazyLoadEmojis = useLazyLoadEmojisConfig();

  useEffect(() => {
    if(!lazyLoadEmojis) return;

    // Preload next batch of images
    categoriesMap.forEach(category => {
      category.emojis.forEach(emoji => {
        preloadEmoji(getEmojiUrl, emoji, emojiStyle);
      });
    });
  }, [emojiStyle, getEmojiUrl, preloadRange, lazyLoadEmojis, categoriesMap]);
}
