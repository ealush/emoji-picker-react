import clsx from 'clsx';
import * as React from 'react';

import { ClassNames } from '../../DomUtils/classNames';
import { useSkinTonesDisabledConfig } from '../../config/useConfig';
import skinToneVariations, {
  skinTonesNamed
} from '../../data/skinToneVariations';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useFocusSearchInput } from '../../hooks/useFocus';
import { SkinTones } from '../../types/exposedTypes';
import Relative from '../Layout/Relative';
import { Button } from '../atoms/Button';
import { useSkinTonePickerRef } from '../context/ElementRefContext';
import {
  useActiveSkinToneState,
  useSkinToneFanOpenState
} from '../context/PickerContext';
import './SkinTonePicker.css';

const FULL_SIZE = 28;

type Props = Readonly<{
  expands?: boolean;
}>;

export function SkinTonePicker({ expands = true }: Props = {}) {
  const SkinTonePickerRef = useSkinTonePickerRef();
  const isDisabled = useSkinTonesDisabledConfig();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();
  const closeAllOpenToggles = useCloseAllOpenToggles();
  const focusSearchInput = useFocusSearchInput();

  if (isDisabled) {
    return null;
  }

  const flexBasis =
    isOpen && expands
      ? `${FULL_SIZE * skinToneVariations.length}px`
      : FULL_SIZE + 'px';

  return (
    <Relative
      className={clsx('epr-skin-tones', { [ClassNames.open]: isOpen })}
      style={{ flexBasis }}
    >
      <div className="epr-skin-tone-select" ref={SkinTonePickerRef}>
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;
          return (
            <Button
              style={{
                transform: clsx(
                  `translateX(-${i * (isOpen ? FULL_SIZE : 0)}px)`,
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
