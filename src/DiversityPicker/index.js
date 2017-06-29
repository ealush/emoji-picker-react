import React from 'react';
import Emoji from '../Emoji';
import { bgImage, memberWithModifier } from '../Emoji/helpers';
import './style.scss';

function DiversityPicker({ emoji, assetPath, emojiResolution, onEmojiClick, close }) {

    const className = `diversity-picker${emoji ? ' shown' : ''}`;

    function onClick(diversity) {
        onEmojiClick(diversity, emoji);
        close();
    }

    if (emoji && emoji.member) {
        emoji.diversities = emoji.diversities || [];
        if (emoji.diversities.indexOf(emoji.member) === -1) {
            emoji.diversities.unshift(emoji.member);
        }
    }

    return (
        <div className={className}>
            {
                emoji && emoji.diversities && emoji.diversities.map((diversity) => {
                    const style = bgImage({ member: diversity, assetPath, emojiResolution });
                    return (<a href="#!" key={diversity} style={style} className="emoji" onMouseDown={(() => onClick(diversity))}/>);
                })
            }
        </div>
    );
}

export default DiversityPicker;
