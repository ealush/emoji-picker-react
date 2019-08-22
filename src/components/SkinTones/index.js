import React, { useContext } from 'react';
import { skinTones } from '../../../lib/initEMojis';
import { PickerContext, actionTypes } from '../../lib/reducer';
import { Ul, Tone } from './styled';
import { NEUTRAL, DATA_NAME } from './constants';

export {
    NEUTRAL, DATA_NAME
};

const SkinTones = () => {
    const { state: { skinTonesSpread, activeSkinTone }, dispatch } = useContext(PickerContext);

    const handleClick = () => {
        dispatch({
            type: actionTypes.SKIN_TONES_SPREAD,
            spread: !skinTonesSpread
        });
    };

    const setActiveSkinTone = ({ target: { value } }) => {
        dispatch({
            type: actionTypes.ACTIVE_SKIN_TONE_SET,
            skinTone: value
        });
    }

    return (
        <Ul>
        {
            skinTones.map((tone, i) => {
                const isActive = tone === activeSkinTone;

                return (
                    <Tone key={tone}
                        className={`t${tone}`}
                        style={{
                            transform: `translateX(-${skinTonesSpread ? i * 20 : 0}px) scale(${isActive ? '1.5' : 1})`,
                            zIndex: isActive ? 2 : 1}}>
                        <input type="radio"
                            onChange={setActiveSkinTone}
                            name="skin-tone"
                            value={tone}
                            id={`tone_${tone}`}/>
                        <label htmlFor={`tone_${tone}`} data-name={DATA_NAME} onClick={handleClick}/>
                    </Tone>
                );
            })
        }
        </Ul>
    )
}

export default SkinTones;
