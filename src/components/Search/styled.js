import styled from 'styled-components';
import { BORDER_BASE, BORDER_DARK } from '../../lib/colors';

const Input = styled.input`
    width: 100%;
    outline: none;
    box-shadow: none;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid ${BORDER_BASE};
    border-left: 0;
    border-right: 0;
    transition: border .1s;

    &:focus {
        border: 1px solid ${BORDER_DARK};
        border-left: 0;
        border-right: 0;
    }
`;

export default Input;