import React, { useContext } from 'react';
import skinTones from '../../skinTones';
import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_SKIN_VARIATIONS } from '../../../lib/constants';
import { PickerContext } from '../../lib/reducer';
import backgroundImage from '../../lib/backgroundImage';
import './style.css';

const VariationsMenu = () => {
    const { state: { variationMenu }} = useContext(PickerContext);

    if (!variationMenu) {
        return null;
    }

    return (
        <div className="variations-wrapper">
            <ul className="variation-list">{skinTones.map((tone, index) => {
                const unified = variationMenu[EMOJI_PROPERTY_SKIN_VARIATIONS].find((v) => (
                    v.includes(tone)
                )) || variationMenu[EMOJI_PROPERTY_UNIFIED];
                const bgImg = backgroundImage(unified);

                return (
                    <li key={unified}>
                        <button style={bgImg}/>
                    </li>
                );
            })}</ul>
        </div>
    );
}

export default VariationsMenu;
