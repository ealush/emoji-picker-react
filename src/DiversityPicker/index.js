import React from 'react';
import PropTypes from 'prop-types';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import { bgImage } from '../Emoji/helpers';
import './style.scss';

function DiversityPicker({ index, assetPath, emojiResolution, onEmojiClick, close, disable }) {

    if (disable) {
        return null;
    }

    const className = `diversity-picker${index ? ' shown' : ''}`,
        emoji = emojiAccessor(emojis[index]);

    let diversities = null;

    function onClick(diversity, e) {
        onEmojiClick(diversity, emoji, e);
        setTimeout(close, 500);
    }

    if (emoji && emoji.diversities) {
        diversities = [emoji.unified].concat(emoji.diversities);
    }

    return (
        <div className={className}>{
            diversities && diversities.map((diversity) => {
                const style = bgImage({ unified: diversity, assetPath, emojiResolution });
                return (
                    <a key={diversity}
                        style={style}
                        className="emoji"
                        onClick={((e) => onClick(diversity, e))}/>
                );
            })
        }</div>
    );
}

DiversityPicker.propTypes = {
    index: PropTypes.number,
    assetPath: PropTypes.string,
    emojiResolution: PropTypes.number,
    onEmojiClick: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    disable: PropTypes.bool
};

export default DiversityPicker;
