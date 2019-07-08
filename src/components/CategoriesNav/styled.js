import styled from 'styled-components';
import { GLOBAL_PADDING } from '../../styled';

const Nav = styled.nav`
    padding: 0 ${GLOBAL_PADDING}px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;

    button {
        height: 40px;
        width: 20px;
        padding: 5px 0;
        background-repeat: no-repeat;
        background-size: 20px;
        background-position: 50% 50%;
        cursor: pointer;
        opacity: .6;
        transition: opacity .1s;

        &:hover {
            opacity: .7;
        }
    }
`;

export default Nav;
