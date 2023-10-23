import * as React from 'react';

import { ClassNames, clsx } from '../../DomUtils/classNames';
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
      className={clsx(ClassNames.emoji, {
        [ClassNames.hidden]: hidden,
        [ClassNames.hiddenOnSearch]: hiddenOnSearch,
        [ClassNames.visible]: !hidden && !hiddenOnSearch,
        [ClassNames.emojiHasVariations]: hasVariations && showVariations
      })}
      data-unified={unified}
      aria-label={emojiNames[0]}
      data-full-name={emojiNames}
    >
      {children}
    </Button>
  );
}
