import skinTones from '../../skinTones';
import React from 'react';

import { useActiveSkinTone, useSetActiveSkinTone, useSkinToneSpreadValue, useToggleSpreadSkinTones } from '../../PickerContext';
import { DATA_NAME, SKIN_TONE_DARK, SKIN_TONE_LIGHT, SKIN_TONE_MEDIUM, SKIN_TONE_MEDIUM_DARK, SKIN_TONE_MEDIUM_LIGHT, SKIN_TONE_NEUTRAL } from './constants';

import './style.css';

export {
  SKIN_TONE_NEUTRAL,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_DARK,
  DATA_NAME,
};

const SkinTones = () => {
  const toggleSkinTonesSpread = useToggleSpreadSkinTones();
  const skinToneSpread = useSkinToneSpreadValue();
  const setActiveSkinTone = useSetActiveSkinTone();
  const activeSkinTone = useActiveSkinTone();

  const handleClick = () => {
    toggleSkinTonesSpread();
  };

  return (
    <ul className="skin-tones-list">
      {skinTones.map((tone, i) => {
        const isActive = tone === activeSkinTone;

        return (
          <li
            key={tone}
            className={`t${tone}`}
            style={{
              transform: `translateX(-${skinToneSpread ? i * 20 : 0}px) scale(${
                isActive ? '1.5' : 1
              })`,
              zIndex: isActive ? 2 : 1,
            }}
          >
            <input
              type="radio"
              onChange={({ target: { value } }) => setActiveSkinTone(value)}
              name="skin-tone"
              value={tone}
              id={`tone_${tone}`}
            />
            <label
              htmlFor={`tone_${tone}`}
              data-name={DATA_NAME}
              onClick={handleClick}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default SkinTones;
