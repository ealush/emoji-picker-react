import React, { useContext } from 'react';
import skinTones from '../../skinTones';
import { PickerContext, actionTypes } from '../../lib/reducer';
import {
    SKIN_TONE_NEUTRAL,
    SKIN_TONE_LIGHT,
    SKIN_TONE_MEDIUM_LIGHT,
    SKIN_TONE_MEDIUM,
    SKIN_TONE_MEDIUM_DARK,
    SKIN_TONE_DARK,
    DATA_NAME
} from './constants';
import './style.css';

export {
    SKIN_TONE_NEUTRAL,
    SKIN_TONE_LIGHT,
    SKIN_TONE_MEDIUM_LIGHT,
    SKIN_TONE_MEDIUM,
    SKIN_TONE_MEDIUM_DARK,
    SKIN_TONE_DARK,
    DATA_NAME
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
    };

    return (
        <ul className="skin-tones-list">
            {
                skinTones.map((tone, i) => {
                    const isActive = tone === activeSkinTone;

                    return (
                        <li key={tone}
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
                        </li>
                    );
                })
            }
        </ul>
    );
};

export default SkinTones;
