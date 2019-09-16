import React from 'react';
import cn from 'classnames';
import backgroundImage from '../../lib/backgroundImage';
import { EMOJI_PROPERTY_SKIN_VARIATIONS, EMOJI_PROPERTY_SORT_ORDER, EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_NAME } from '../../../lib/constants';
import { PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW } from './colors';
import './style.css';

const pastels = [ PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW ];
const bgColor = (order) => pastels[order % pastels.length];

let mouseDownTimeout = null;

const handleMouseUp = () => clearTimeout(mouseDownTimeout);

const Emoji = ({ emoji,
    shouldLoad,
    emojiUrl,
    hidden,
    activeSkinTone,
    openVariationMenu,
    variationMenuOpen,
    handleMouseEnter,
    handleMouseLeave,
    onEmojiClick
}) => {
    const hasSkinVariation = emoji[EMOJI_PROPERTY_SKIN_VARIATIONS];
    let unified;

    const style = {
        order: emoji[EMOJI_PROPERTY_SORT_ORDER],
        ...hidden && { display: 'none' },
        color: bgColor(emoji[EMOJI_PROPERTY_SORT_ORDER])
    };

    if (hasSkinVariation && emoji[EMOJI_PROPERTY_SKIN_VARIATIONS]) {
        unified = emoji[EMOJI_PROPERTY_SKIN_VARIATIONS].find((u) => (
            u.indexOf(activeSkinTone) >= 0
        ));
    }

    if (!unified) {
        unified = emoji[EMOJI_PROPERTY_UNIFIED];
    }

    const handleMouseDown = () => {

        if (!hasSkinVariation) {
            return;
        }

        mouseDownTimeout = setTimeout(() => {
            openVariationMenu(emoji);
        }, 500);
    }

    const handleEmojiClick = (e) => {
        console.log(variationMenuOpen)
        if (variationMenuOpen) {
            return;
        }

        onEmojiClick && onEmojiClick(e, {
            unified,
            emoji: String.fromCodePoint(parseInt(unified, 16)),
            originalUnified: emoji[EMOJI_PROPERTY_UNIFIED],
            names: emoji[EMOJI_PROPERTY_NAME],
            activeSkinTone
        });
    };

    return (
        <li style={style}
            className={cn('emoji', { 'has-skin-variation': hasSkinVariation })}>
            <button onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onClick={handleEmojiClick}
                style={{...shouldLoad && backgroundImage(unified, emojiUrl)}}/>
        </li>
    );
};

export default Emoji;
