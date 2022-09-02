import * as React from 'react';
import './SkinTonePicker.css';

import skinToneVariations from '../../data/skinToneVariations';
import clsx from 'clsx';
import {
  useActiveSkinToneState,
  useSkinToneFanOpenState
} from '../context/PickerContext';
import Relative from '../Layout/Relative';
import { useCloseAllOpenToggles } from '../../hooks/useCloseAllOpenToggles';
import { useSkinTonesDisabledConfig } from '../../config/useConfig';

export function SkinTonePicker() {
  const isDisabled = useSkinTonesDisabledConfig();
  const [isOpen, setIsOpen] = useSkinToneFanOpenState();
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();
  const { closeAllOpenToggles } = useCloseAllOpenToggles();

  if (isDisabled) {
    return null;
  }

  return (
    <Relative
      className={clsx('epr-skin-tones', {
        open: isOpen
      })}
    >
      <div className="epr-skin-tone-select" onClick={() => setIsOpen(!isOpen)}>
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;
          return (
            <button
              style={{
                transform: clsx(
                  `translateX(-${i * (isOpen ? 28 : 0)}px)`,
                  isOpen && active && 'scale(1.3)'
                )
              }}
              onClick={() => {
                isOpen && setActiveSkinTone(skinToneVariation);
                closeAllOpenToggles();
              }}
              key={skinToneVariation}
              className={clsx(`epr-tone-${skinToneVariation}`, 'epr-tone', {
                active
              })}
            ></button>
          );
        })}
      </div>
    </Relative>
  );
}
