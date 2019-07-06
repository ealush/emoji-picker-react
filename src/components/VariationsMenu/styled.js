import styled from 'styled-components';
import { darken } from 'polished';
import { BACKGROUND_BASE, BORDER_BASE } from '../../lib/colors';

export const VariationsWrapper = styled.div`
    position: relative;
`;

export const VariationList = styled.ul`
    background: ${BACKGROUND_BASE};
    border-bottom: 1px solid ${BORDER_BASE};
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 10;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: space-evenly;
    list-style-type: none;

    button {
        height: 35px;
        width: 35px;
        background-size: 20px 20px;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        background-color: transparent;
        border-radius: 5px;
        transition: background .1s;

        &:hover {
            background-color: ${darken(.2, BACKGROUND_BASE)};
        }
    }
`;