import React, { useContext } from 'react';
import skinTones from '../../skinTones';
import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_SKIN_VARIATIONS } from '../../../lib/constants';
import emojiOutput from '../../lib/emojiOutput';
import { PickerContext } from '../../lib/reducer';
import backgroundImage from '../../lib/backgroundImage';
import './style.css';

const VariationsMenu = ({closeVariations}) => {
    const { state: { variationMenu, emojiUrl, activeSkinTone, onEmojiClick }} = useContext(PickerContext);

    if (!variationMenu) {
        return null;
    }

    return (
        <div className="variations-wrapper">
            <ul className="variation-list">{skinTones.map((tone, index) => {
                const unified = variationMenu[EMOJI_PROPERTY_SKIN_VARIATIONS].find((v) => (
                    v.includes(tone)
                )) || variationMenu[EMOJI_PROPERTY_UNIFIED];
                const bgImg = backgroundImage(unified, emojiUrl);

                const handleClick = (e) => {
                    closeVariations(e);

                    return onEmojiClick(e, emojiOutput(variationMenu, unified, activeSkinTone));
                };

                return (
                    <li key={unified}>
                        <button style={bgImg} onClick={handleClick} onMouseDown={(e) => e.stopPropagation()}/>
                    </li>
                );
            })}</ul>
        </div>
    );
}

export default VariationsMenu;
