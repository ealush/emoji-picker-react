import * as React from 'react';

import { CustomCategoryConfig } from '../../config/categoryConfig';
import { useCustomEmojisConfig } from '../../config/useConfig';
import { emojiName, emojiNames } from '../../dataUtils/emojiSelectors';
import { useShouldHideCustomEmojis } from '../../hooks/useShouldHideCustomEmojis';
import { ClickableEmojiButton } from '../emoji/ClickableEmojiButton';

import { EmojiCategory } from './EmojiCategory';

type Props = Readonly<{
  categoryConfig: CustomCategoryConfig;
}>;

export function CustomCategory({ categoryConfig }: Props) {
  const hidden = useShouldHideCustomEmojis();
  const customEmojis = useCustomEmojisConfig();

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      hiddenOnSearch
      hidden={hidden}
    >
      {customEmojis.map(customEmoji => {
        if (!customEmoji) {
          return null;
        }

        const name = emojiName(customEmoji);

        return (
          <ClickableEmojiButton
            key={name}
            emojiNames={emojiNames(customEmoji)}
            hidden={false}
            hiddenOnSearch={false}
            showVariations={false}
            hasVariations={false}
          >
            nothing
          </ClickableEmojiButton>
        );
      })}
    </EmojiCategory>
  );
}
