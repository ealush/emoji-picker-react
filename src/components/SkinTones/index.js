import PropTypes from 'prop-types';
import React from 'react';
import skinTones from '../../skinTones';

import {
  useActiveSkinTone,
  useSetActiveSkinTone,
  useSkinToneSpreadValue,
  useToggleSpreadSkinTones,
} from '../../PickerContext';
import {
  DATA_NAME,
  SKIN_TONE_DARK,
  SKIN_TONE_LIGHT,
  SKIN_TONE_MEDIUM,
  SKIN_TONE_MEDIUM_DARK,
  SKIN_TONE_MEDIUM_LIGHT,
  SKIN_TONE_NEUTRAL,
} from './constants';

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

const SkinTones = ({ skinToneSpreadRef }) => {
  const toggleSkinTonesSpread = useToggleSpreadSkinTones();
  const isOpen = useSkinToneSpreadValue();
  const setActiveSkinTone = useSetActiveSkinTone();
  const activeSkinTone = useActiveSkinTone();

  return (
    <div
      className="skin-tones-list"
      ref={skinToneSpreadRef}
      onClick={e => e.preventDefault()}
    >
      {skinTones.map((tone, i) => {
        const isActive = tone === activeSkinTone;

        return (
          <button
            key={tone}
            id={`t${tone}`}
            tabIndex={i + 1}
            style={{
              transform: `translateX(-${isOpen ? i * 20 : 0}px) scale(${
                isActive ? '1.5' : 1
              })`,
              zIndex: isActive ? 2 : 1,
            }}
            onClick={() => {
              if (isOpen) {
                setActiveSkinTone(tone);
              }
              toggleSkinTonesSpread();
            }}
          />
        );
      })}
    </div>
  );
};

export default SkinTones;

SkinTones.propTypes = {
  skinToneSpreadRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }),
};
