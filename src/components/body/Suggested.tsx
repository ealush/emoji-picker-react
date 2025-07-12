import * as React from 'react';

import { CategoryConfig } from '../../config/categoryConfig';
import {
  useEmojiStyleConfig,
  useGetEmojiUrlConfig,
  useSuggestedEmojisModeConfig
} from '../../config/useConfig';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import { getSuggested } from '../../dataUtils/suggested';
import { useIsEmojiDisallowed } from '../../hooks/useDisallowedEmojis';
import { useIsEverMounted } from '../../hooks/useIsEverMounted';
import { useUpdateSuggested } from '../context/PickerContext';
import { ClickableEmoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
}>;

export function Suggested({ categoryConfig }: Props) {
  const [suggestedUpdated] = useUpdateSuggested();
  const isMounted = useIsEverMounted();
  const suggestedEmojisModeConfig = useSuggestedEmojisModeConfig();
  const getEmojiUrl = useGetEmojiUrlConfig();
  const suggested = React.useMemo(
    () => getSuggested(suggestedEmojisModeConfig) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [suggestedUpdated, suggestedEmojisModeConfig]
  );
  const emojiStyle = useEmojiStyleConfig();
  const isEmojiDisallowed = useIsEmojiDisallowed();

  if (!isMounted) {
    return null;
  }

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      hiddenOnSearch
      hidden={suggested.length === 0}
    >
      {suggested.map(suggestedItem => {
        const emoji = emojiByUnified(suggestedItem.original);

        if (!emoji) {
          return null;
        }

        if (isEmojiDisallowed(emoji)) {
          return null;
        }

        return (
          <ClickableEmoji
            showVariations={false}
            unified={suggestedItem.unified}
            emojiStyle={emojiStyle}
            emoji={emoji}
            key={suggestedItem.unified}
            getEmojiUrl={getEmojiUrl}
          />
        );
      })}
    </EmojiCategory>
  );
}
