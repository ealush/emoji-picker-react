import styled from 'react-emotion';
import {
    HEIGHT_SEARCH_BAR,
    PADDING_SEARCH_BAR,
    COLOR_FILTER_INPUT,
    BORDER_FILTER,
    COLOR_FILTER_PLACEHOLDER,
    BORDER_FILTER_FOCUS,
    TOP_LEFT_MAGNIFIER,
    BG_IMG_FIND
} from '../styled';

const Div = styled('div')`
    height: ${HEIGHT_SEARCH_BAR};
    margin-top: 0;
    padding: ${PADDING_SEARCH_BAR};
    position: relative;
    z-index: 2;
    left: 0;
    box-sizing: border-box;

    input {
        padding: 5px 5px 5px 35px;
        margin: 0;
        box-sizing: border-box;
        color: ${COLOR_FILTER_INPUT};
        width: 100%;
        outline: none;
        border: 1px solid ${BORDER_FILTER};
        border-radius: 5px;
        transition: border .2s;

        &::placeholder {
            color: ${COLOR_FILTER_PLACEHOLDER};
        }

        &:focus {
            border: 1px solid ${BORDER_FILTER_FOCUS};

            + i:before {
                opacity: 1;
            }
        }

    }

    i:before {
        content: '';
        background-repeat: no-repeat;
        background-image: ${BG_IMG_FIND};
        background-position: 50% 50%;
        background-size: 15px 15px;
        height: 15px;
        width: 15px;
        position: absolute;
        left: ${TOP_LEFT_MAGNIFIER};
        top: ${TOP_LEFT_MAGNIFIER};
        display: block;
        opacity: .3;
        transition: opacity .2s;
    }
`;

export {
    Div
};