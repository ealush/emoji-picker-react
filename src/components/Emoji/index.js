import React, { useState } from 'react';
import backgroundImage from '../../lib/backgroundImage';
import { PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW } from '../../lib/colors';
import { Li } from './styled'

const pastels = [ PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW ];
const bgColor = (order) => pastels[order % pastels.length];

let mouseDownTimeout = null;

const handleMouseUp = () => {
    clearTimeout(mouseDownTimeout);
}

const Emoji = React.memo(({ emoji, hidden, activeSkinTone, openVariationMenu, handleMouseEnter, handleMouseLeave}) => {
    const hasSkinVariation = emoji.skin_variations;
    let unified = emoji.unified;

    const style = {
        order: emoji.sort_order,
        ...hidden && { display: 'none' },
        color: bgColor(emoji.sort_order)
    };

    if (hasSkinVariation && emoji.skin_variations[activeSkinTone]) {
        unified = emoji.skin_variations[activeSkinTone].unified;
    }

    const handleMouseDown = () => {

        if (!hasSkinVariation) {
            return;
        }

        mouseDownTimeout = setTimeout(() => {
            openVariationMenu(emoji);
        }, 500);
    }

    return (
        <Li style={style} hasSkinVariation={hasSkinVariation} className={hasSkinVariation ? 'has-skin-variation' : undefined}>
            <button onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                style={backgroundImage(unified)}/>
        </Li>
    );
});

export default Emoji;
