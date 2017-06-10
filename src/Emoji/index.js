import React from 'react';
import { bgImage } from './helpers';
import './style.scss';

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

    if (!categorySeen || hidden) {
        const hiddenClass = hidden ? ' hidden' : '';
        return <li className={`emoji${hiddenClass}`} style={style}/>;
    }

    const bgStyle = bgImage({ member, assetPath, emojiResolution });

    return (
        <li className="emoji" style={style}>
            <a href="#!"
                style={bgStyle}
                tabIndex={emoji.order}
                onClick={(e) => onClick(e, emoji)}/>
            <span>{emoji.shortname}</span>
        </li>
    );
}

export default Emoji;