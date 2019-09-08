import React from 'react';
import backgroundImage from '../../lib/backgroundImage';
import { EMOJI_PROPERTY_SKIN_VARIATIONS, EMOJI_PROPERTY_SORT_ORDER, EMOJI_PROPERTY_UNIFIED } from '../../../lib/constants';
import { PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW } from './colors';
import './style.css';

const pastels = [ PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW ];
const bgColor = (order) => pastels[order % pastels.length];

let mouseDownTimeout = null;

const handleMouseUp = () => {
    clearTimeout(mouseDownTimeout);
}

const Emoji = React.memo(({ emoji, hidden, activeSkinTone, openVariationMenu, handleMouseEnter, handleMouseLeave}) => {
    const hasSkinVariation = emoji[EMOJI_PROPERTY_SKIN_VARIATIONS];
    let unified = emoji[EMOJI_PROPERTY_UNIFIED];

    const style = {
        order: emoji[EMOJI_PROPERTY_SORT_ORDER],
        ...hidden && { display: 'none' },
        color: bgColor(emoji[EMOJI_PROPERTY_SORT_ORDER])
    };

    if (hasSkinVariation && emoji[EMOJI_PROPERTY_SKIN_VARIATIONS][activeSkinTone]) {
        unified = emoji[EMOJI_PROPERTY_SKIN_VARIATIONS][activeSkinTone][EMOJI_PROPERTY_UNIFIED];
    }

    const handleMouseDown = () => {

        if (!hasSkinVariation) {
            return;
        }

        mouseDownTimeout = setTimeout(() => {
            openVariationMenu(emoji);
        }, 500);
    }

    let className = 'emoji';
    className += hasSkinVariation ? ' has-skin-variation' : '';


    return (
        <li style={style} hasSkinVariation={hasSkinVariation} className={className}>
            <button onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                style={backgroundImage(unified)}/>
        </li>
    );
});

export default Emoji;
