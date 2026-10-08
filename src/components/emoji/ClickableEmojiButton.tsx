import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import {
  commonInteractionStyles,
  commonStyles,
  stylesheet,
} from '../../Stylesheet/stylesheet';
import { Button } from '../atoms/Button';

type ClickableEmojiButtonProps = Readonly<{
  hidden?: boolean;
  showVariations?: boolean;
  hiddenOnSearch?: boolean;
  emojiNames: string[];
  children: React.ReactNode;
  hasVariations: boolean;
  unified?: string;
  noBackground?: boolean;
  className?: string;
  style?: React.CSSProperties;
  role?: string;
  logicalIndex?: number;
}>;

// eslint-disable-next-line complexity
export function ClickableEmojiButton({
  emojiNames,
  unified,
  hidden,
  hiddenOnSearch,
  showVariations = true,
  hasVariations,
  children,
  className,
  noBackground = false,
  style,
  role,
  logicalIndex,
}: ClickableEmojiButtonProps) {
  return (
    <Button
      className={cx(
        styles.emoji,
        hidden && commonStyles.hidden,
        hiddenOnSearch && commonInteractionStyles.hiddenOnSearch,
        {
          [ClassNames.visible]: !hidden && !hiddenOnSearch,
        },
        !!(hasVariations && showVariations) && styles.hasVariations,
        noBackground && styles.noBackground,
        className,
      )}
      data-unified={unified}
      data-epr-unified={unified}
      data-epr-index={logicalIndex}
      aria-label={getAriaLabel(emojiNames)}
      data-full-name={emojiNames}
      style={style}
      role={role}
    >
      {children}
    </Button>
  );
}

function getAriaLabel(emojiNames: string[]) {
  return emojiNames[emojiNames.length - 1];
}

const styles = stylesheet.create({
  emoji: {
    '.': ClassNames.emoji,
    position: 'relative',
    width: 'var(--epr-emoji-fullsize)',
    height: 'var(--epr-emoji-fullsize)',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 'var(--epr-emoji-fullsize)',
    maxHeight: 'var(--epr-emoji-fullsize)',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'var(--epr-emoji-hover-color)',
    },
    ':focus': {
      backgroundColor: 'var(--epr-focus-bg-color)',
    },
  },
  noBackground: {
    background: 'none',
    ':hover': {
      backgroundColor: 'transparent',
      background: 'none',
    },
    ':focus': {
      backgroundColor: 'transparent',
      background: 'none',
    },
  },
  hasVariations: {
    '.': ClassNames.emojiHasVariations,
    ':after': {
      content: '',
      display: 'block',
      width: '0',
      height: '0',
      right: '0px',
      bottom: '1px',
      position: 'absolute',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      transform: 'rotate(135deg)',
      borderBottom: '4px solid var(--epr-emoji-variation-indicator-color)',
      zIndex: 'var(--epr-emoji-variations-indictator-z-index)',
    },
    ':hover:after': {
      borderBottom:
        '4px solid var(--epr-emoji-variation-indicator-color-hover)',
    },
  },
});
