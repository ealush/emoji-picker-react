import React from 'react';
import PropTypes from 'prop-types';
import { emojis } from '../emoji-data';
import emojiAccessor from '../emoji-data/emoji_accessor';
import { bgImage } from '../Emoji/helpers';
import { Div } from './styled';
import { ButtonEmoji } from '../Emoji';

function DiversityPicker({ index, assetPath, emojiResolution, onEmojiClick, close, disable }) {

    if (disable) {
        return null;
    }

    const emoji = emojiAccessor(emojis[index]);

    let diversities = null;

    function onClick(diversity, e) {
        onEmojiClick(diversity, emoji, e);
        setTimeout(close, 500);
    }

    if (emoji && emoji.diversities) {
        diversities = [emoji.unified].concat(emoji.diversities);
    }

    return (
        <Div shown={index}>{
            diversities && diversities.map((diversity) => {
                const style = bgImage({ unified: diversity, assetPath, emojiResolution });
                return (
                    <ButtonEmoji shown
                        key={diversity}
                        onClick={((e) => onClick(diversity, e))}
                        tabIndex={emoji.order}>
                        <i style={style}/>
                    </ButtonEmoji>
                );
            })
        }</Div>
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
