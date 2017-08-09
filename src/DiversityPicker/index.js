import React from 'react';
import { emojis } from '../emoji-data';
import { bgImage } from '../Emoji/helpers';
import './style.scss';

function DiversityPicker({ name, assetPath, emojiResolution, onEmojiClick, close }) {

    const className = `diversity-picker${name ? ' shown' : ''}`,
        emoji = emojis[name];

    let diversities = null;

    function onClick(diversity) {
        onEmojiClick(diversity, emoji);
        close();
    }

    if (emoji && emoji.diversities) {
        diversities = [emoji.unified].concat(emoji.diversities);
    }

    return (
        <div className={className}>{
            diversities && diversities.map((diversity) => {
                const style = bgImage({ unified: diversity, assetPath, emojiResolution });
                return (
                    <a href="#!"
                        key={diversity}
                        style={style}
                        className="emoji"
                        onMouseDown={(() => onClick(diversity))}/>
                );
            })
        }</div>
    );
}

export default DiversityPicker;
