import React from 'react';
import PropTypes from 'prop-types';
import { modifiers } from '../emoji-data';
import './style.scss';

const NEUT = 'neutral';

function SkinTones({onModifierClick, activeModifier, spread }) {

    const spreadClass = spread ? ' spread' : '';

    return (
        <ul className={`skin-tones${spreadClass}`}>
            {modifiers.map((modifier, index) => {

                const isNeutral = modifier === NEUT,
                    isSelected = activeModifier === modifier || !activeModifier && isNeutral,
                    selectedClass = isSelected ? ' selected' : '',
                    modifierClass = `${isNeutral ? '' : 'm'}${modifier}${selectedClass}`;

                const style = {};

                if (spread) {
                    if (isSelected) {
                        style.transform = `translateX(${-index*20}px) scale(1.5)`;
                    } else {
                        style.transform = `translateX(${-index*20}px)`;
                    }
                }

                return (
                    <li className={modifierClass} style={style} key={modifier}>
                        <a className="st" onClick={(e) => onModifierClick(e, modifier)}></a>
                    </li>
                );
            })}
        </ul>
    );
}

SkinTones.propTypes = {
    onModifierClick: PropTypes.func.isRequired,
    activeModifier: PropTypes.string,
    spread: PropTypes.bool
};

export default SkinTones;