import styled from 'styled-components';
import { TEXT_DARK } from '../../lib/colors';

export const Li = styled.li`
    position: relative;

    &.has-skin-variation:before {
        content: '';
        display: block;
        height: 5px;
        width: 5px;
        background: ${TEXT_DARK};
        position: absolute;
        top: 0;
        right: 0;
        border-radius: 0 5px 0 0;
    }

    button {
        color: inherit;
        height: 35px;
        width: 35px;
        border-radius: 5px;
        background-size: 20px 20px;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        transition: .1s background;

        &:hover {
            background-color: currentColor;
        }
    }
`;