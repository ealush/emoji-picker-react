import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import * as propTypes from '../../lib/propTypes';
import { EMOJI_PROPERTY_SKIN_VARIATIONS, EMOJI_PROPERTY_UNIFIED } from '../../../lib/constants';
import EmojiImg from '../EmojiImg';
import { PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW } from './colors';
import './style.css';

const pastels = [ PASTEL_BLUE, PASTEL_RED, PASTEL_GREEN, PASTEL_PURPULE, PASTEL_YELLOW ];
const bgColor = (order) => pastels[order % pastels.length];

let mouseDownTimeout = null;

const handleMouseUp = () => clearTimeout(mouseDownTimeout);

const Emoji = ({
    emoji,
    shouldLoad,
    hidden,
    activeSkinTone,
    openVariationMenu,
    variationMenuOpen,
    handleMouseEnter,
    handleMouseLeave,
    onEmojiClick,
    index,
    dispatch
}) => {
    const hasSkinVariation = emoji[EMOJI_PROPERTY_SKIN_VARIATIONS];
    let unified;

    const style = {
        ...hidden && { display: 'none' },
        color: bgColor(index)
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

        if (!hasSkinVariation || !openVariationMenu) {
            return;
        }

        mouseDownTimeout = setTimeout(() => {
            openVariationMenu(emoji);
        }, 500);
    };

    const handleEmojiClick = (e) => {

        if (variationMenuOpen) {
            return;
        }

        onEmojiClick(e, unified, emoji, activeSkinTone);
    };

    return (
        <li style={style}
            className={cn('emoji', { 'has-skin-variation': hasSkinVariation && openVariationMenu })}>
            <button onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                type="button"
                onClick={handleEmojiClick}>
                <EmojiImg unified={unified} shouldLoad={shouldLoad} dispatch={dispatch}/>
            </button>
        </li>
    );
};

export default Emoji;

Emoji.propTypes = {
    emoji: propTypes.emoji,
    shouldLoad: PropTypes.bool,
    hidden: PropTypes.bool,
    activeSkinTone: PropTypes.string,
    openVariationMenu: PropTypes.func,
    variationMenuOpen: PropTypes.bool,
    handleMouseEnter: PropTypes.func,
    handleMouseLeave: PropTypes.func,
    onEmojiClick: PropTypes.func,
    index: PropTypes.number,
    dispatch: PropTypes.func
};
