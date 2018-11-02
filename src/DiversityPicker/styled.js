import styled from 'react-emotion';
import {
    BG_DIVERSITY_PICKER,
    HEIGHT_DIVERSITY_PICKER,
    BORDER_DIVERSITY_PICKER
} from '../styled';

const Div = styled('div')`
    background-color: ${BG_DIVERSITY_PICKER};
    display: flex;
    justify-content: space-around;
    flex-direction: row-reverse;
    position: absolute;
    z-index: 3;
    left: 0;
    top: 0;
    right: 0;
    height: ${HEIGHT_DIVERSITY_PICKER};
    transform: translateY(-${HEIGHT_DIVERSITY_PICKER});
    opacity: .6;
    transition: .2s opacity, .2s transform;

    ${({shown}) => {
        if (!shown) { return; }
        return `
            transform: translateY(0);
            opacity: 1;
            border-bottom: 1px solid ${BORDER_DIVERSITY_PICKER};
        `;
    }}

    button, button:hover {
        background: none;
    }
`;

export {
    Div
};