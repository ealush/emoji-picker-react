import * as React from 'react';
import './SkinTonePicker.css';
import { useState } from 'react';

import skinToneVariations from '../../data/skinToneVariations';
import clsx from 'clsx';
import { useActiveSkinToneState } from '../context/PickerContext';
import Relative from '../Layout/Relative';
import { useSkinTonesDisabledConfig } from '../context/PickerConfigContext';

export function SkinTonePicker() {
  const isDisabled = useSkinTonesDisabledConfig();
  const [fanOpen, setFanOpen] = useState(false);
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();

  if (isDisabled) {
    return null;
  }

  return (
    <Relative
      className={clsx('epr-skin-tones', {
        open: fanOpen
      })}
    >
      <div
        className="epr-skin-tone-select"
        onClick={() => setFanOpen(!fanOpen)}
      >
        {skinToneVariations.map((skinToneVariation, i) => {
          const active = skinToneVariation === activeSkinTone;
          return (
            <button
              style={{
                transform: clsx(
                  `translateX(-${i * (fanOpen ? 28 : 0)}px)`,
                  fanOpen && active && 'scale(1.3)'
                )
              }}
              onClick={() => {
                fanOpen && setActiveSkinTone(skinToneVariation);
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
