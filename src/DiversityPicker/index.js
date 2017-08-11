import React from 'react';
import PropTypes from 'prop-types';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import { bgImage } from '../Emoji/helpers';
import './style.scss';

function DiversityPicker({ name, assetPath, emojiResolution, onEmojiClick, close }) {

    const className = `diversity-picker${name ? ' shown' : ''}`,
        emoji = emojiAccessor(emojis[name]);

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

DiversityPicker.propTypes = {
    name: PropTypes.string.isRequired,
    assetPath: PropTypes.string.isRequired,
    emojiResolution: PropTypes.number.isRequired,
    onEmojiClick: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired
};

export default DiversityPicker;
