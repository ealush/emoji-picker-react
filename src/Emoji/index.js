import React from 'react';
import './style.scss';

function bgImage(name, assetPath) {
    return {
        'backgroundImage': `url(${assetPath}/${name}.png)`
    };
}

function Emoji({member, emoji, hidden, activeModifier, assetPath, onEmojiClick}) {

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
        bgStyle = bgImage(member, assetPath);

    return (
        <li className={`emoji${hiddenClass}`} style={style}>
            <a href="#!" style={bgStyle} tabIndex={emoji.order} onClick={(e) => onClick(e, emoji)}><span className="hidden">{emoji.shortname}</span></a>
            <span>{emoji.shortname}</span>
        </li>
    );
}

export default Emoji;