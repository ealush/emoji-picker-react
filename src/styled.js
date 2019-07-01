import styled, { css } from 'styled-components';
import { WHITE, BORDER_BASE } from './lib/colors';

const HEIGHT_DEFAULT = 320;
const WIDTH_DEFAULT = 280;

const ratio = ({ height = HEIGHT_DEFAULT, width = WIDTH_DEFAULT }) => css`
    height: ${height}px;
    width: ${width}px;
`;

const Aside = styled.aside`
    background: ${WHITE};
    ${ratio}
    font-family: sans-serif;
    padding: 10px 0;
    border: 1px solid ${BORDER_BASE};
    border-radius: 5px;
    box-sizing: border-box;
    box-shadow: 0 5px 10px ${BORDER_BASE};
    overflow: hidden;
    position: relative;

    button {
        border: none;
        cursor: pointer;
        outline: none;
    }
`;

export default Aside;