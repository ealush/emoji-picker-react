import styled from 'styled-components';
import { BORDER_BASE, BORDER_DARK } from '../../lib/colors';

const Input = styled.input`
    width: calc(100% - 30px);
    margin-left: 15px;
    outline: none;
    box-shadow: none;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid ${BORDER_BASE};
    border-radius: 3px;
    transition: border .1s;

    &:focus {
        border: 1px solid ${BORDER_DARK};
    }
`;

export default Input;
