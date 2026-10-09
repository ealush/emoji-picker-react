import * as React from 'react';
import { cx } from 'shipstyles';

import { stylesheet } from '../../../Stylesheet/stylesheet';
import { PickerLabels } from '../../../config/config';
import { useLabels } from '../../../config/useConfig';
import { useDefaultAppearance } from '../../../primitives/appearance';
import { usePickerComponents } from '../../../primitives/components';
import { SkinTones } from '../../../types/exposedTypes';
import { Button } from '../../atoms/Button';

type Props = {
  isOpen: boolean;
  onClick: () => void;
  isActive: boolean;
  skinToneVariation: SkinTones;
  style?: React.CSSProperties;
  tabIndex?: number;
};

// eslint-disable-next-line complexity
export function BtnSkinToneVariation({
  isOpen,
  onClick,
  isActive,
  skinToneVariation,
  style,
  tabIndex,
}: Props) {
  const labels = useLabels();
  const appearance = useDefaultAppearance();
  const { SkinToneButton: Custom } = usePickerComponents();
  const decorated = appearance && !Custom;
  const glyph =
    '✋' +
    (skinToneVariation === SkinTones.NEUTRAL
      ? ''
      : String.fromCodePoint(parseInt(skinToneVariation, 16)));
  const props = {
    type: 'button' as const,
    style,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!event.defaultPrevented) onClick();
    },
    tabIndex,
    className: cx(
      `epr-tone-${skinToneVariation}`,
      styles.geometry,
      decorated && styles.tone,
      !isOpen && styles.closedTone,
      isActive && styles.active,
    ),
    'aria-pressed': isActive,
    'aria-label': labels[SKIN_TONE_LABEL_KEYS[skinToneVariation]],
    'data-epr-part': 'skin-tone-button',
    'data-epr-active': isActive ? '' : undefined,
    'data-epr-open': isOpen ? '' : undefined,
    children: decorated ? undefined : glyph,
  };
  return Custom ? (
    <Custom
      {...props}
      tone={{ skinTone: skinToneVariation, isActive, isOpen }}
    />
  ) : (
    <Button {...props} />
  );
}

const SKIN_TONE_LABEL_KEYS: Record<SkinTones, keyof PickerLabels> = {
  [SkinTones.NEUTRAL]: 'skinToneNeutral',
  [SkinTones.LIGHT]: 'skinToneLight',
  [SkinTones.MEDIUM_LIGHT]: 'skinToneMediumLight',
  [SkinTones.MEDIUM]: 'skinToneMedium',
  [SkinTones.MEDIUM_DARK]: 'skinToneMediumDark',
  [SkinTones.DARK]: 'skinToneDark',
};

const styles = /* @__PURE__ */ (() =>
  stylesheet.create({
    geometry: {
      width: 'var(--epr-skin-tone-size)',
      height: 'var(--epr-skin-tone-size)',
      display: 'block',
      position: 'absolute',
      insetInlineEnd: '0',
      zIndex: '0',
    },
    closedTone: {
      opacity: '0',
      zIndex: '0',
    },
    active: {
      '.': 'epr-active',
      zIndex: '1',
      opacity: '1',
    },
    tone: {
      '.': 'epr-tone',
      cursor: 'pointer',
      borderRadius: '4px',
      transition: 'transform 0.3s ease-in-out, opacity 0.35s ease-in-out',
      border: '1px solid var(--epr-skin-tone-outer-border-color)',
      boxShadow: 'inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)',
      ':hover': {
        boxShadow:
          '0 0 0 3px var(--epr-active-skin-hover-color), inset 0px 0px 0 1px var(--epr-skin-tone-inner-border-color)',
      },
      ':focus': {
        boxShadow: '0 0 0 3px var(--epr-focus-bg-color)',
      },
      '&.epr-tone-neutral': {
        backgroundColor: '#ffd225',
      },
      '&.epr-tone-1f3fb': {
        backgroundColor: '#ffdfbd',
      },
      '&.epr-tone-1f3fc': {
        backgroundColor: '#e9c197',
      },
      '&.epr-tone-1f3fd': {
        backgroundColor: '#c88e62',
      },
      '&.epr-tone-1f3fe': {
        backgroundColor: '#a86637',
      },
      '&.epr-tone-1f3ff': {
        backgroundColor: '#60463a',
      },
    },
  }))();
