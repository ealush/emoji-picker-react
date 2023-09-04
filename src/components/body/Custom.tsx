import * as React from 'react';

import { CustomCategoryConfig } from '../../config/categoryConfig';
import { emojiName, emojiNames } from '../../dataUtils/emojiSelectors';
import { ClickableEmojiButton } from '../emoji/ClickableEmojiButton';

import { EmojiCategory } from './EmojiCategory';

type Props = Readonly<{
  categoryConfig: CustomCategoryConfig;
}>;

export function Custom({ categoryConfig }: Props) {
  const { emojis } = categoryConfig;

  return (
    <EmojiCategory
      categoryConfig={categoryConfig}
      hiddenOnSearch
      hidden={emojis.length === 0}
    >
      {emojis.map(customEmoji => {
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
