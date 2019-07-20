import styled from 'styled-components';
import { GLOBAL_PADDING } from '../../styled';

const Nav = styled.nav`
    padding: 0 ${GLOBAL_PADDING}px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;

    &.inactive {
        button, button.active, button:hover {
            opacity: .4;
            cursor: default;
        }
    }

    button {
        height: 40px;
        width: 20px;
        padding: 5px 0;
        background-repeat: no-repeat;
        background-size: 20px;
        background-position: 50% 50%;
        cursor: pointer;
        opacity: .5;
        transition: opacity .1s;

        &.active {
            opacity: 1;
        }

        &:hover {
            opacity: .7;
        }
    }
`;

export default Nav;
