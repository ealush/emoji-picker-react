import * as React from 'react';

import { ClassNames, clsx } from '../../DomUtils/classNames';
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
      className={clsx('epr-skin-tones', direction, {
        [ClassNames.open]: isOpen
      })}
      style={
        vertical
          ? { flexBasis: expandedSize, height: expandedSize }
          : { flexBasis: expandedSize }
      }
    >
      <div className="epr-skin-tone-select" ref={SkinTonePickerRef}>
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;
          return (
            <Button
              style={{
                transform: clsx(
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
              className={clsx(`epr-tone-${skinToneVariation}`, 'epr-tone', {
                [ClassNames.active]: active
              })}
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
