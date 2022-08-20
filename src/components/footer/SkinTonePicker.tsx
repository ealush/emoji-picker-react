import * as React from 'react';
import './SkinTonePicker.css';
import { useState } from 'react';

import skinToneVariations from '../../data/skinToneVariations';
import clsx from 'clsx';

export function SkinTonePicker() {
  const [fanOpen, setFanOpen] = useState(false);
  const [selectedSkinTone, setSelectedSkinTone] = useState<string>(
    skinToneVariations[0]
  );

  return (
    <div className="epr-skin-tones" onClick={() => setFanOpen(!fanOpen)}>
      {skinToneVariations.map((skinToneVariation, i) => {
        const isActive = skinToneVariation === selectedSkinTone;
        return (
          <button
            style={{
              transform: clsx(
                `translateX(-${i * (fanOpen ? 20 : 0)}px)`,
                isActive && 'scale(1.4)'
              )
            }}
            onClick={() => {
              fanOpen && setSelectedSkinTone(skinToneVariation);
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
