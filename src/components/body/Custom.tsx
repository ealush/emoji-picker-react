import * as React from 'react';

import { CustomCategory } from '../../config/categoryConfig';
// import { emojiName } from '../../dataUtils/emojiSelectors';
// import { ClickableEmoji } from '../emoji/Emoji';

import { EmojiCategory } from './EmojiCategory';

type Props = Readonly<{
  categoryConfig: CustomCategory;
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

        return null;
        // <ClickableEmoji
        //   showVariations={false}
        //   // emoji={customEmoji}
        //   key={emojiName(customEmoji)}
        //   getEmojiUrl={() => customEmoji.imgUrl}
        // />
      })}
    </EmojiCategory>
  );
}
