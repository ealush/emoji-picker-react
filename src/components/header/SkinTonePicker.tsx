/* eslint-disable complexity */
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { stylesheet } from '../../Stylesheet/stylesheet';
import { useSkinTonesDisabledConfig } from '../../config/useConfig';
import skinToneVariations, {
  skinTonesNamed
} from '../../data/skinToneVariations';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useFocusSearchInput } from '../../hooks/useFocus';
import { SkinTones } from '../../types/exposedTypes';
import Absolute from '../Layout/Absolute';
import Relative from '../Layout/Relative';
import { Button } from '../atoms/Button';
import { useSkinTonePickerRef } from '../context/ElementRefContext';
import {
  useActiveSkinToneState,
  useSkinToneFanOpenState
} from '../context/PickerContext';

import './SkinTonePicker.css';
import { cx } from 'flairup';

const ITEM_SIZE = 28;

type Props = {
  direction?: SkinTonePickerDirection;
};

export function SkinTonePickerMenu() {
  return (
    <Relative style={{ height: ITEM_SIZE }}>
      <Absolute style={{ bottom: 0, right: 0 }}>
        <SkinTonePicker direction={SkinTonePickerDirection.VERTICAL} />
      </Absolute>
    </Relative>
  );
}

export function SkinTonePicker({
  direction = SkinTonePickerDirection.HORIZONTAL
}: Props) {
  const SkinTonePickerRef = useSkinTonePickerRef();
  const isDisabled = useSkinTonesDisabledConfig();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const focusSearchInput = useFocusSearchInput();

  if (isDisabled) {
    return null;
  }

  const fullWidth = `${ITEM_SIZE * skinToneVariations.length}px`;

  const expandedSize = isOpen ? fullWidth : ITEM_SIZE + 'px';

  const vertical = direction === SkinTonePickerDirection.VERTICAL;

  return (
    <Relative
      className={cx(
        styles.skinTones,
        vertical && styles.vertical,
        isOpen && styles.open
      )}
      style={
        vertical
          ? { flexBasis: expandedSize, height: expandedSize }
          : { flexBasis: expandedSize }
      }
    >
      <div className={cx(styles.select)} ref={SkinTonePickerRef}>
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;
          return (
            <Button
              style={{
                transform: cx(
                  vertical
                    ? `translateY(-${i * (isOpen ? ITEM_SIZE : 0)}px)`
                    : `translateX(-${i * (isOpen ? ITEM_SIZE : 0)}px)`,
                  isOpen && active && 'scale(1.3)'
                )
              }}
              onClick={() => {
                if (isOpen) {
                  setActiveSkinTone(skinToneVariation);
                  focusSearchInput();
                } else {
                  setIsOpen(true);
                }
                closeAllOpenToggles();
              }}
              key={skinToneVariation}
              className={cx(
                `epr-tone-${skinToneVariation}`,
                styles.tone,
                !isOpen && styles.closedTone,
                active && styles.active
              )}
              tabIndex={isOpen ? 0 : -1}
              aria-pressed={active}
              aria-label={`Skin tone ${
                skinTonesNamed[skinToneVariation as SkinTones]
              }`}
            ></Button>
          );
        })}
      </div>
    </Relative>
  );
}

export enum SkinTonePickerDirection {
  VERTICAL = ClassNames.vertical,
  HORIZONTAL = ClassNames.horizontal
}

const styles = stylesheet.create({
  skinTones: {
    '.': 'epr-skin-tones',
    '--': {
      '--epr-skin-tone-size': '15px'
    },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    transition: 'all 0.3s ease-in-out',
    padding: '10px 0'
  },
  vertical: {
    padding: '5px',
    alignItems: 'flex-end',
    flexDirection: 'column',
    borderRadius: '6px',
    border: '1px solid var(--epr-bg-color)'
  },
  open: {
    // @ts-ignore
    backdropFilter: 'blur(5px)',
    background: 'var(--epr-skin-tone-picker-menu-color)',
    // @ts-ignore
    '&.epr-active:after': {
      content: '',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      borderRadius: '5px',
      border: '1px solid var(--epr-active-skin-tone-indicator-border-color)'
    }
  },
  select: {
    '.': 'epr-skin-tone-select',
    position: 'relative',
    width: 'var(--epr-skin-tone-size)',
    height: 'var(--epr-skin-tone-size)',
    // @ts-ignore
    '> button': {
      width: 'var(--epr-skin-tone-size)',
      display: 'block',
      cursor: 'pointer',
      borderRadius: '4px',
      height: 'var(--epr-skin-tone-size)',
      position: 'absolute',
      right: '0',
      transition: 'transform 0.3s ease-in-out, opacity 0.35s ease-in-out',
      zIndex: '0',
      boxShadow: '0 0 0 0px var(--epr-active-skin-hover-color)'
    }
  },
  tone: {
    '.': 'epr-tone',
    ':hover': {
      boxShadow: '0 0 0 3px var(--epr-active-skin-hover-color)'
    },
    ':focus': {
      boxShadow: '0 0 0 3px var(--epr-focus-bg-color)'
    }
  },
  closedTone: {
    opacity: '0',
    zIndex: '0'
  },
  active: {
    '.': 'epr-active',
    zIndex: '1',
    opacity: '1'
  }
});
