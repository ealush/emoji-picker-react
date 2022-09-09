import * as React from 'react';

import { CategoryConfig } from '../../config/categoryConfig';
import {
  useEmojiStyleConfig,
  useSuggestedEmojisModeConfig
} from '../../config/useConfig';
import { emojiByUnified } from '../../dataUtils/emojiSelectors';
import { getsuggested } from '../../dataUtils/suggested';
import {
  useSearchTermState,
  useUpdateSuggested
} from '../context/PickerContext';
import { Emoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';

type Props = Readonly<{
  categoryConfig: CategoryConfig;
}>;

export function Suggested({ categoryConfig }: Props) {
  const [suggestedUpdated] = useUpdateSuggested();
  const [searchTerm] = useSearchTermState();
  const suggestedEmojisModeConfig = useSuggestedEmojisModeConfig();
  const suggested = React.useMemo(
    () => getsuggested(suggestedEmojisModeConfig) ?? [],
    [suggestedUpdated]
  );
  const emojiStyle = useEmojiStyleConfig();

  const hidden = !!(searchTerm || suggested.length === 0);

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      hiddenOnSearch
      hidden={hidden}
    >
      {suggested.map(suggestedItem => {
        const emoji = emojiByUnified(suggestedItem.original);

        if (!emoji) {
          return null;
        }

        return (
          <Emoji
            showVariations={false}
            unified={suggestedItem.unified}
            emojiStyle={emojiStyle}
            emoji={emoji}
            key={suggestedItem.unified}
            hidden={hidden}
          />
        );
      })}
    </EmojiCategory>
  );
}
