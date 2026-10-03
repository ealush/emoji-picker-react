import * as React from 'react';
import { cx } from 'shipstyles';

import { ClassNames } from '../../DomUtils/classNames';
import {
  commonInteractionStyles,
  commonStyles,
  stylesheet,
} from '../../Stylesheet/stylesheet';
import { Button, buttonStyles } from '../atoms/Button';
import { EmojiRenderProps, ListEmoji } from '../body/listComponents';

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
  tabIndex?: number;
  /** Consumer cell (List `components.Emoji`) replacing the default button. */
  as?: React.ComponentType<EmojiRenderProps>;
  emojiInfo?: ListEmoji;
  /** `gridcell` inside the emoji grid; native button role elsewhere. */
  role?: 'gridcell';
}>;

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
  tabIndex,
  as: Custom,
  emojiInfo,
  role,
}: ClickableEmojiButtonProps) {
  const cellClassName = emojiCellClassName({
    hidden,
    hiddenOnSearch,
    hasVariations,
    showVariations,
    noBackground,
    className,
  });

  if (Custom && emojiInfo) {
    const managedProps = {
      type: 'button' as const,
      role,
      tabIndex,
      className: cx(buttonStyles.button, cellClassName),
      'data-epr-part': 'emoji',
      'data-epr-unified': unified,
      'aria-label': getAriaLabel(emojiNames),
      'data-epr-full-name': emojiNames.join(','),
      style,
    };
    return (
      <Custom {...managedProps} emoji={emojiInfo}>
        {children}
      </Custom>
    );
  }

  return (
    <Button
      tabIndex={tabIndex}
      role={role}
      className={cellClassName}
      data-epr-part="emoji"
      data-epr-unified={unified}
      aria-label={getAriaLabel(emojiNames)}
      data-epr-full-name={emojiNames}
      style={style}
    >
      {children}
    </Button>
  );
}

function emojiCellClassName({
  hidden,
  hiddenOnSearch,
  hasVariations,
  showVariations,
  noBackground,
  className,
}: {
  hidden?: boolean;
  hiddenOnSearch?: boolean;
  hasVariations: boolean;
  showVariations: boolean;
  noBackground: boolean;
  className?: string;
}): string {
  return cx(
    styles.emoji,
    hidden && commonStyles.hidden,
    hiddenOnSearch && commonInteractionStyles.hiddenOnSearch,
    {
      [ClassNames.visible]: !hidden && !hiddenOnSearch,
    },
    !!(hasVariations && showVariations) && styles.hasVariations,
    noBackground && styles.noBackground,
    className,
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
