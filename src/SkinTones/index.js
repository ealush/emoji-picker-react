import React from 'react';
import PropTypes from 'prop-types';
import { modifiers } from '../emoji-data';
import { Ul, Modifier } from './styled';

const NEUT = 'neutral';

function SkinTones({onModifierClick, activeModifier, spread }) {

    return (
        <Ul>
            {modifiers.map((modifier, index) => {

                const isNeutral = modifier === NEUT,
                    isSelected = activeModifier === modifier || !activeModifier && isNeutral,
                    modifierClass = `${isNeutral ? '' : 'm'}${modifier}`;

                return (
                    <Modifier className={modifierClass}
                        spread={spread}
                        isSelected={isSelected}
                        index={index}
                        key={modifier}>
                        <button className="st" onClick={(e) => onModifierClick(e, modifier)}/>
                    </Modifier>
                );
            })}
        </Ul>
    );
}

SkinTones.propTypes = {
    onModifierClick: PropTypes.func.isRequired,
    activeModifier: PropTypes.string,
    spread: PropTypes.bool
};

export default SkinTones;