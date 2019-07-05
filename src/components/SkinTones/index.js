import React, { useState,  } from 'react';
import { skinTones } from '../../../lib/initEMojis';
import { Ul, Tone } from './styled';
export { NEUTRAL } from './constants';

export const SkinToneContext = React.createContext({});

const SkinTones = ({ activeSkinTone, setActiveSkinTone }) => {
    const [spread, setSpread] = useState(false);

    const handleClick = () => {
        setSpread(!spread);
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
                            transform: `translateX(-${spread ? i * 20 : 0}px) scale(${isActive ? '1.5' : 1})`,
                            zIndex: isActive ? 2 : 1}}>
                        <input type="radio"
                            onChange={() => setActiveSkinTone(tone)}
                            name="skin-tone"
                            value={tone}
                            id={`tone_${tone}`}/>
                        <label htmlFor={`tone_${tone}`} onClick={handleClick}/>
                    </Tone>
                );
            })
        }
        </Ul>
    )
}

export default SkinTones;