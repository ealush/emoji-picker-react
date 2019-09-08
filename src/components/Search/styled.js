import styled from 'styled-components';
import { GLOBAL_PADDING } from '../../styled';
import { BORDER_BASE, BORDER_DARK } from '../../lib/colors';

const Input = styled.input`
    width: calc(100% - ${GLOBAL_PADDING * 2}px);
    margin-left: ${GLOBAL_PADDING}px;
    outline: none;
    box-shadow: none;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid #efefef;
    border-radius: 3px;
    transition: border .1s;

    &:focus {
        border: 1px solid ${BORDER_DARK};
    }
`;

export default Input;
