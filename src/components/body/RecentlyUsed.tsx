import * as React from 'react';
import { CategoryConfig } from '../../config/categoryConfig';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import { getRecentlyUsed } from '../../dataUtils/recentlyUsed';
import { useEmojiStyleConfig } from '../context/PickerConfigContext';
import { useSearchTermState } from '../context/PickerContext';
import { Emoji } from '../emoji/Emoji';
import { EmojiCategory } from './EmojiCategory';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
}>;

export function RecentlyUsed({ categoryConfig }: Props) {
  const [searchTerm] = useSearchTermState();
  const recentlyUsed = getRecentlyUsed();
  const emojiStyle = useEmojiStyleConfig();

  if (searchTerm) {
    return null;
  }

  if (recentlyUsed.length === 0) {
    return null;
  }

  return (
    <EmojiCategory categoryConfig={categoryConfig}>
      {recentlyUsed.map(recentlyUsedItem => {
        const emoji = emojiByUnified(recentlyUsedItem.original);

        if (!emoji) {
          return null;
        }

        return (
          <Emoji
            showVariations={false}
            unified={recentlyUsedItem.unified}
            emojiStyle={emojiStyle}
            emoji={emoji}
          />
        );
      })}
    </EmojiCategory>
  );
}
