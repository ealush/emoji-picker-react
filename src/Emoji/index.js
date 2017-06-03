import React from 'react';
import './style.scss';
import { DEFAULt_CDN_PATH, DEFAULT_IMAGE_RESOLUTION } from '../constants';

function bgImage({ member, assetPath, categorySeen, emojiResolution }) {

    if (!categorySeen) {
        return {};
    }

    if (typeof assetPath === 'undefined') {
        assetPath = DEFAULt_CDN_PATH;
    }

    assetPath += emojiResolution ? `/${emojiResolution}` : `/${DEFAULT_IMAGE_RESOLUTION}`;

    return {
        'backgroundImage': `url(${assetPath}/${member}.png)`
    };
}

function Emoji({member, emoji, hidden, categorySeen, emojiProps}) {
    const {
        activeModifier,
        assetPath,
        onEmojiClick,
        emojiResolution
    } = emojiProps;

    if (emoji.hasOwnProperty('diversity') && emoji.diversity !== member) {
        return null;
    }

    if (activeModifier && emoji.hasOwnProperty('diversities')) {
        const currentDiversity = `${member}-${activeModifier}`;
        if (emoji.diversities.indexOf(currentDiversity) > -1) {
            member = currentDiversity;
        }
    }

    function onClick(e, emoji) {
        e.preventDefault();
        onEmojiClick && onEmojiClick(member, emoji);
    }

    const style = {
        order: emoji.order
    };

    const hiddenClass = hidden ? ' hidden' : '',
        bgStyle = bgImage({ member, assetPath, categorySeen, emojiResolution });

    return (
        <li className={`emoji${hiddenClass}`} style={style}>
            <a href="#!" style={bgStyle} tabIndex={emoji.order} onClick={(e) => onClick(e, emoji)}><span className="hidden">{emoji.shortname}</span></a>
            {categorySeen && <span>{emoji.shortname}</span>}
        </li>
    );
}

export default Emoji;