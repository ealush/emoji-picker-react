import { cx } from 'flairup';
import * as React from 'react';

import { stylesheet } from '../../../Stylesheet/stylesheet';
import { skinTonesNamed } from '../../../data/skinToneVariations';
import { SkinTones } from '../../../types/exposedTypes';
import { Button } from '../../atoms/Button';

type Props = {
  isOpen: boolean;
  onClick: () => void;
  isActive: boolean;
  skinToneVariation: SkinTones;
  style?: React.CSSProperties;
};

// eslint-disable-next-line complexity
export function BtnSkinToneVariation({
  isOpen,
  onClick,
  isActive,
  skinToneVariation,
  style
}: Props) {
  return (
    <Button
      style={style}
      onClick={onClick}
      className={cx(
        `epr-tone-${skinToneVariation}`,
        styles.tone,
        !isOpen && styles.closedTone,
        isActive && styles.active
      )}
      aria-pressed={isActive}
      aria-label={`Skin tone ${skinTonesNamed[skinToneVariation as SkinTones]}`}
    ></Button>
  );
}

const styles = stylesheet.create({
  closedTone: {
    opacity: '0',
    zIndex: '0'
  },
  active: {
    '.': 'epr-active',
    zIndex: '1',
    opacity: '1'
  },
  tone: {
    '.': 'epr-tone',
    width: 'var(--epr-skin-tone-size)',
    display: 'block',
    cursor: 'pointer',
    borderRadius: '4px',
    height: 'var(--epr-skin-tone-size)',
    position: 'absolute',
    right: '0',
    transition: 'transform 0.3s ease-in-out, opacity 0.35s ease-in-out',
    zIndex: '0',
    border: '1px solid var(--epr-skin-tone-outer-border-color)',
    boxShadow: 'inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)',
    ':hover': {
      boxShadow: '0 0 0 3px var(--epr-active-skin-hover-color), inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)'
    },
    ':focus': {
      boxShadow: '0 0 0 3px var(--epr-focus-bg-color)'
    },
    '&.epr-tone-neutral': {
      backgroundColor: '#ffd225'
    },
    '&.epr-tone-1f3fb': {
      backgroundColor: '#ffdfbd'
    },
    '&.epr-tone-1f3fc': {
      backgroundColor: '#e9c197'
    },
    '&.epr-tone-1f3fd': {
      backgroundColor: '#c88e62'
    },
    '&.epr-tone-1f3fe': {
      backgroundColor: '#a86637'
    },
    '&.epr-tone-1f3ff': {
      backgroundColor: '#60463a'
    }
  }
});
