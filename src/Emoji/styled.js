import styled from 'styled-components';
import {
    SIZE_EMOJI,
    PADDING_EMOJI,
    BG_EMOJI_HOVER,
    BG_DIVERSITY_INDICATOR
} from '../styled';

const Button = styled.button`
    display: none;
    border: 0;
    outline: none;
    border-radius: 5px;
    padding: 0;
    position: relative;
    overflow: hidden;

    i {
        height: ${SIZE_EMOJI};
        width: ${SIZE_EMOJI};
        display: inline-block;
        padding: ${PADDING_EMOJI};
        background-size: ${SIZE_EMOJI};
        background-repeat: no-repeat;
        background-position: 50% 50%;
        transition: background-color .2s;
    }

    ${({ shown }) => shown ? 'display: inline-block;' : ''}

    &:hover {
        background-color: ${BG_EMOJI_HOVER};

        &:before {
            opacity: 1;
        }
    }

    ${({ hasDiversities }) => hasDiversities ? `
        &:before {
            content: '';
            position: absolute;
            background-color: ${BG_DIVERSITY_INDICATOR};
            display: block;
            top: 0;
            right: 0;
            width: 5px;
            height: 5px;
            opacity: 0;
            transition: opacity .2s;
        }
    ` : ''}
`;

export {
    Button
};