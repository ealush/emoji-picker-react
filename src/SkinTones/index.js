import React from 'react';
import emojiModifiers from '../emoji-data/modifiers.json';
import './style.scss';

const NEUT = 'neutral';

function SkinTones({onModifierClick, activeModifier, spread }) {

    const spreadClass = spread ? ' spread' : '';

    return (
        <ul className={`skin-tones${spreadClass}`}>
            {emojiModifiers.map((modifier, index) => {

                const isNeutral = modifier === NEUT,
                    isSelected = activeModifier === modifier || !activeModifier && isNeutral,
                    selectedClass = isSelected ? ' selected' : '',
                    modifierClass = `${isNeutral ? '' : 'm'}${modifier}${selectedClass}`;

                const style = {};

                if (spread) {
                    if (isSelected) {
                        style.transform = `translateX(${-index*20}px) scale(1.6)`;
                    } else {
                        style.transform = `translateX(${-index*20}px)`;
                    }
                }

                return (
                    <li className={modifierClass} style={style} key={modifier}>
                        <a href="#!" onClick={(e) => onModifierClick(e, modifier)}></a>
                    </li>
                );
            })}
        </ul>
    );
}

export default SkinTones;