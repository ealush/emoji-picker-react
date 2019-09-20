import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import skinTones from '../../skinTones';
import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_SKIN_VARIATIONS } from '../../../lib/constants';
import { PickerContext } from '../../lib/reducer';
import EmojiImg from '../EmojiImg';
import './style.css';

const VariationsMenu = ({ closeVariations }) => {
    const { state: { variationMenu, activeSkinTone, onEmojiClick }} = useContext(PickerContext);

    if (!variationMenu) {
        return null;
    }

    return (
        <div className="variations-wrapper">
            <ul className="variation-list">{skinTones.map((tone) => {
                const unified = variationMenu[EMOJI_PROPERTY_SKIN_VARIATIONS].find((v) => (
                    v.includes(tone)
                )) || variationMenu[EMOJI_PROPERTY_UNIFIED];

                const handleClick = (e) => {
                    closeVariations(e);

                    return onEmojiClick(e, unified, variationMenu, activeSkinTone);
                };

                return (
                    <li key={unified}>
                        <button onClick={handleClick} onMouseDown={(e) => e.stopPropagation()}>
                            <EmojiImg unified={unified}/>
                        </button>
                    </li>
                );
            })}</ul>
        </div>
    );
};

export default VariationsMenu;

VariationsMenu.propTypes = {
    closeVariations: PropTypes.func
};
