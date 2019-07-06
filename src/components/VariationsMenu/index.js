import React, { useContext } from 'react';
import { skinTones } from '../../../lib/initEMojis';
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
            <VariationList>{skinTones.map((tone) => {

                const { unified } = variationMenu.skin_variations[tone] || variationMenu;
                const bgImg = backgroundImage(unified);

                return (
                    <li key={unified}>
                        <button
                            style={bgImg}></button>
                    </li>
                );
            })}</VariationList>
        </VariationsWrapper>
    );
}

export default VariationsMenu;