import { cx } from 'flairup';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { commonStyles } from '../../Stylesheet/stylesheet';
import { Button } from '../atoms/Button';

import './Emoji.css';

type ClickableEmojiButtonProps = Readonly<{
  hidden?: boolean;
  showVariations?: boolean;
  hiddenOnSearch?: boolean;
  emojiNames: string[];
  children: React.ReactNode;
  hasVariations: boolean;
  unified?: string;
}>;

export function ClickableEmojiButton({
  emojiNames,
  unified,
  hidden,
  hiddenOnSearch,
  showVariations = true,
  hasVariations,
  children
}: ClickableEmojiButtonProps) {
  return (
    <Button
      className={cx(
        ClassNames.emoji,
        hidden && commonStyles.hidden,
        hiddenOnSearch && commonStyles.hiddenOnSearch,
        {
          [ClassNames.visible]: !hidden && !hiddenOnSearch,
          [ClassNames.emojiHasVariations]: hasVariations && showVariations
        }
      )}
      data-unified={unified}
      aria-label={emojiNames[0]}
      data-full-name={emojiNames}
    >
      {children}
    </Button>
  );
}
