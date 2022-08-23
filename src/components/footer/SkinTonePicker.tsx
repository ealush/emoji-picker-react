import * as React from 'react';
import './SkinTonePicker.css';
import { useState } from 'react';

import skinToneVariations from '../../data/skinToneVariations';
import clsx from 'clsx';
import { useActiveSkinToneState } from '../contextProvider/PickerContextProvider';

export function SkinTonePicker() {
  const [fanOpen, setFanOpen] = useState(false);
  const [activeSkinTone, setActiveSkinTone] = useActiveSkinToneState();

  return (
    <div className="epr-skin-tones" onClick={() => setFanOpen(!fanOpen)}>
      {skinToneVariations.map((skinToneVariation, i) => {
        const isActive = skinToneVariation === activeSkinTone;
        return (
          <button
            style={{
              transform: clsx(
                `translateX(-${i * (fanOpen ? 20 : 0)}px)`,
                isActive && 'scale(1.4)'
              )
            }}
            onClick={() => {
              fanOpen && setActiveSkinTone(skinToneVariation);
            }}
            key={skinToneVariation}
            className={clsx(
              `epr-tone-${skinToneVariation}`,
              'epr-tone',
              isActive ? 'active' : null
            )}
          ></button>
        );
      })}
    </div>
  );
}
