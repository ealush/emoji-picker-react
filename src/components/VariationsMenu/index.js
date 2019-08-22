import React, { useContext } from 'react';
import { skinTones } from '../../../lib/initEMojis';
import { EMOJI_PROPERTY_UNIFIED, EMOJI_PROPERTY_SKIN_VARIATIONS } from '../../lib/constants';
import { PickerContext } from '../../lib/reducer';
import backgroundImage from '../../lib/backgroundImage';
import { VariationList, VariationsWrapper } from './styled';

const VariationsMenu = () => {
    const { state: { variationMenu }} = useContext(PickerContext);

    if (!variationMenu) {
        return null;
    }

    return (
        <VariationsWrapper>
            <VariationList>{skinTones.map((tone, index) => {
                const unified = variationMenu[EMOJI_PROPERTY_SKIN_VARIATIONS].find((v) => (
                    v.includes(tone)
                )) || variationMenu[EMOJI_PROPERTY_UNIFIED];
                const bgImg = backgroundImage(unified);

                return (
                    <li key={unified}>
                        <button style={bgImg}/>
                    </li>
                );
            })}</VariationList>
        </VariationsWrapper>
    );
}

export default VariationsMenu;
