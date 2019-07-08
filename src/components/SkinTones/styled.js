import styled from 'styled-components';
import { rgb } from 'polished';
import { WHITE, BORDER_BASE } from '../../lib/colors';

export const Ul = styled.ul`
    padding: 0;
    margin: 0;
    list-style-type: none;
    position: absolute;
    top: 22px;
    right: 40px;

    li {
        background-color: currentColor;
        position: absolute;
        padding: 0;
        border-radius: 5px;
        overflow: hidden;
        transition: transform .3s ease;
        box-shadow: 0 0 3px currentColor;
    }
`;

export const Tone = styled.li`

    label {
        height: 10px;
        width: 10px;
        padding: 0;
        display: block;
        cursor: pointer;
    }

    input {
        height: 0;
        width: 0;
        opacity: 0;
        visibility: hidden;
        display: none;
    }

    &.tneutral { color: #ffe082; }
    &.t1f3fb  { color: #ffe0b2 }
    &.t1f3fc  { color: #ffccbc }
    &.t1f3fe  { color: #795548 }
    &.t1f3ff  { color: #5d4037 }
    &.t1f3fd  { color: ${rgb(202, 126, 85)}; }
`;


